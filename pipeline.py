import pandas as pd
import logging
import sys
from typing import TypedDict, Optional, Annotated
from datetime import datetime
from pathlib import Path

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from handlers import OptimizedHandler, OptimizedBatchHandler

from config import (
    REQUIRED_COLUMNS,
    VALID_LABELS,
    OUTPUT_DIR,
    CHECKPOINT_DIR,
    LOG_FILE,
    BATCH_SIZE
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


# Define the state
class ProcessingState(TypedDict):
    """State for the processing pipeline"""
    # Input data
    original_content: str
    title: Optional[str]
    category: Optional[str]
    author: Optional[str]
    date: Optional[str]
    source: Optional[str]
    existing_label: Optional[str]
    
    # Processing state
    current_content: str
    processing_steps: list[str]
    
    # Results
    final_label: str
    label_confidence: float
    label_reasoning: str
    
    # Metadata
    row_index: int
    error: Optional[str]


class OptimizedPipeline:
    """
    Optimized LangGraph-based preprocessing pipeline
    
    KEY OPTIMIZATION: Uses unified processing instead of sequential steps
    """
    
    def __init__(self, use_batch_processing: bool = False, processing_batch_size: int = 3):
        """
        Initialize the pipeline
        
        Args:
            use_batch_processing: If True, use batch processing (multiple rows in 1 API call)
            processing_batch_size: Number of rows to process per batch (if batch processing enabled)
        """
        self.use_batch_processing = use_batch_processing
        self.processing_batch_size = processing_batch_size
        
        # Initialize handler(s)
        if use_batch_processing:
            self.batch_handler = OptimizedBatchHandler(max_batch_size=processing_batch_size)
            logger.info(f"Initialized with BATCH processing (batch size: {processing_batch_size})")
        else:
            self.unified_handler = OptimizedHandler()
            logger.info("Initialized with SINGLE-INSTANCE processing")
        
        # Statistics
        self.stats = {
            'total_processed': 0,
            'code_switching_handled': 0,
            'translated': 0,
            'auto_labeled': 0,
            'errors': 0
        }
        
        # Build the graph (only for single-instance mode)
        if not use_batch_processing:
            self.app = self._build_graph()
    
    def _build_graph(self):
        """Build the LangGraph state machine"""
        
        # Create graph
        workflow = StateGraph(ProcessingState)
        
        # Add single unified processing node (replaces 3 separate nodes used previously for code switching removal, translation to algerian dialect, then labeling)
        workflow.add_node("unified_processing", self._processing_node)
        
        # Define edges
        workflow.set_entry_point("unified_processing")
        workflow.add_edge("unified_processing", END)
        
        # Compile with checkpointing
        memory = MemorySaver()
        return workflow.compile(checkpointer=memory)
    
    def _processing_node(self, state: ProcessingState) -> ProcessingState:
        """
        Unified processing node - handles all tasks in one API call
        
        This single node replaces (previously):
        - _handle_code_switching_node
        - _translate_dialect_node
        - _label_content_node
        """
        logger.info(f"Row {state['row_index']}: Processing (unified)...")
        
        try:
            # Check if we should keep existing label
            if state['existing_label'] and state['existing_label'] in VALID_LABELS:
                # Keep existing label, but still process text
                state['final_label'] = state['existing_label']
                state['label_confidence'] = 1.0
                state['label_reasoning'] = "original_label"
                state['processing_steps'].append("label:kept_original")
                
                # Still process the text for code-switching and dialect
                result = self.unified_handler.process_content(
                    content=state['current_content'],
                    title=state.get('title'),
                    category=state.get('category'),
                    source=state.get('source'),
                    author=state.get('author'),
                    date=state.get('date')
                )
                
                # Update processed text
                state['current_content'] = result.processed_text
                
                # Track processing steps
                state['processing_steps'].append(f"code_switching:{result.code_switching_action}")
                state['processing_steps'].append(f"dialect:{result.dialect_action}")
                
                # Update stats
                if result.code_switching_action == "translated":
                    self.stats['code_switching_handled'] += 1
                if result.dialect_action == "translated":
                    self.stats['translated'] += 1
                
            else:
                # Perform full unified processing
                result = self.unified_handler.process_content(
                    content=state['current_content'],
                    title=state.get('title'),
                    category=state.get('category'),
                    source=state.get('source'),
                    author=state.get('author'),
                    date=state.get('date')
                )
                
                # Update state with all results
                state['current_content'] = result.processed_text
                state['final_label'] = result.label
                state['label_confidence'] = result.label_confidence
                state['label_reasoning'] = result.label_reasoning
                
                # Track processing steps
                state['processing_steps'].append(f"code_switching:{result.code_switching_action}")
                state['processing_steps'].append(f"dialect:{result.dialect_action}")
                state['processing_steps'].append(f"auto_labeled:{result.label}")
                
                # Update stats
                if result.code_switching_action == "translated":
                    self.stats['code_switching_handled'] += 1
                if result.dialect_action == "translated":
                    self.stats['translated'] += 1
                self.stats['auto_labeled'] += 1
            
        except Exception as e:
            logger.error(f"Error in unified processing node: {e}")
            state['error'] = str(e)
            state['final_label'] = 'others'
            state['label_confidence'] = 0.0
            state['label_reasoning'] = f"Error: {str(e)}"
        
        self.stats['total_processed'] += 1
        return state
    
    def process_row(self, row: pd.Series, index: int) -> Optional[dict]:
        """Process a single row through the pipeline"""
        
        # Validate content
        original_content = row.get('content', '')
        if not original_content or pd.isna(original_content):
            logger.warning(f"Row {index + 1}: Empty content, skipping")
            return None
        
        # Initialize state
        initial_state = ProcessingState(
            original_content=original_content,
            title=row.get('title') if not pd.isna(row.get('title')) else None,
            category=row.get('category') if not pd.isna(row.get('category')) else None,
            author=row.get('author') if not pd.isna(row.get('author')) else None,
            date=row.get('date') if not pd.isna(row.get('date')) else None,
            source=row.get('source') if not pd.isna(row.get('source')) else None,
            existing_label=row.get('label') if not pd.isna(row.get('label')) else None,
            current_content=original_content,
            processing_steps=[],
            final_label='',
            label_confidence=0.0,
            label_reasoning='',
            row_index=index + 1,
            error=None
        )
        
        try:
            # Run through the graph 
            config = {"configurable": {"thread_id": f"row_{index}"}}
            final_state = self.app.invoke(initial_state, config)
            
            # Check for errors
            if final_state.get('error'):
                logger.error(f"Row {index + 1}: Processing error: {final_state['error']}")
                self.stats['errors'] += 1
                return None
            
            # Return processed data
            return {
                'category': row.get('category', ''),
                'author': row.get('author', ''),
                'date': row.get('date', ''),
                'source': row.get('source', ''),
                'title': row.get('title', ''),
                'content': final_state['current_content'],
                'label': final_state['final_label'],
                'original_content': original_content,
                'label_confidence': final_state['label_confidence'],
                'label_reasoning': final_state['label_reasoning'],
                'processing_steps': '|'.join(final_state['processing_steps'])
            }
            
        except Exception as e:
            logger.error(f"Error processing row {index + 1}: {e}")
            self.stats['errors'] += 1
            return None
    
    def process_batch(self, batch_rows: list[tuple[pd.Series, int]]) -> list[Optional[dict]]:
        """
        Process a batch of rows in a single API call
        
        Args:
            batch_rows: List of (row, index) tuples
            
        Returns:
            List of processed row dictionaries (or None for failed/skipped rows)
        """
        # Prepare batch data
        batch_data = []
        valid_indices = []  # Track which rows are valid
        
        for row, idx in batch_rows:
            original_content = row.get('content', '')
            if not original_content or pd.isna(original_content):
                logger.warning(f"Row {idx + 1}: Empty content, skipping")
                continue
            
            # Check if we should keep existing label
            existing_label = row.get('label') if not pd.isna(row.get('label')) else None
            needs_labeling = not (existing_label and existing_label in VALID_LABELS)
            
            batch_data.append({
                'content': original_content,
                'title': row.get('title') if not pd.isna(row.get('title')) else None,
                'category': row.get('category') if not pd.isna(row.get('category')) else None,
                'author': row.get('author') if not pd.isna(row.get('author')) else None,
                'date': row.get('date') if not pd.isna(row.get('date')) else None,
                'source': row.get('source') if not pd.isna(row.get('source')) else None,
                'existing_label': existing_label,
                'needs_labeling': needs_labeling,
                'index': idx
            })
            valid_indices.append(idx)
        
        if not batch_data:
            logger.warning("Empty batch, no valid rows to process")
            return [None] * len(batch_rows)
        
        try:
            logger.info(f"Processing batch of {len(batch_data)} rows (indices: {valid_indices})")
            
            # Call batch handler
            results = self.batch_handler.process_batch(batch_data)
            
            # Map results back to rows
            processed_rows = []
            result_idx = 0
            
            for row, idx in batch_rows:
                # Skip if row was invalid
                if idx not in valid_indices:
                    processed_rows.append(None)
                    continue
                
                # Get corresponding result
                if result_idx >= len(results):
                    logger.error(f"Row {idx + 1}: Missing result from batch")
                    self.stats['errors'] += 1
                    processed_rows.append(None)
                    result_idx += 1
                    continue
                
                result = results[result_idx]
                original_data = batch_data[result_idx]
                result_idx += 1
                
                # Build processing steps
                processing_steps = [
                    f"code_switching:{result.code_switching_action}",
                    f"dialect:{result.dialect_action}"
                ]
                
                # Update stats
                if result.code_switching_action == "translated":
                    self.stats['code_switching_handled'] += 1
                if result.dialect_action == "translated":
                    self.stats['translated'] += 1
                
                # Use existing label if available, otherwise use LLM label
                if original_data['existing_label'] and original_data['existing_label'] in VALID_LABELS:
                    final_label = original_data['existing_label']
                    label_confidence = 1.0
                    label_reasoning = "original_label"
                    processing_steps.append("label:kept_original")
                else:
                    final_label = result.label
                    label_confidence = result.label_confidence
                    label_reasoning = result.label_reasoning
                    processing_steps.append(f"auto_labeled:{result.label}")
                    self.stats['auto_labeled'] += 1
                
                self.stats['total_processed'] += 1
                
                # Build output dict
                processed_rows.append({
                    'category': row.get('category', ''),
                    'author': row.get('author', ''),
                    'date': row.get('date', ''),
                    'source': row.get('source', ''),
                    'title': row.get('title', ''),
                    'content': result.processed_text,
                    'label': final_label,
                    'original_content': original_data['content'],
                    'label_confidence': label_confidence,
                    'label_reasoning': label_reasoning,
                    'processing_steps': '|'.join(processing_steps)
                })
            
            return processed_rows
            
        except Exception as e:
            logger.error(f"Error processing batch: {e}")
            self.stats['errors'] += len(batch_data)
            return [None] * len(batch_rows)
    
    def process_dataset(
        self,
        input_path: str,
        output_path: Optional[str] = None,
        start_from: int = 0
    ) -> pd.DataFrame:
        """
        Process entire dataset through the optimized pipeline
        
        Args:
            input_path: Path to input CSV file
            output_path: Path to save processed CSV
            start_from: Row index to start from
            
        Returns:
            Processed DataFrame
        """
        mode_desc = f"BATCH (size={self.processing_batch_size})" if self.use_batch_processing else "SINGLE-INSTANCE"
        logger.info(f"Starting OPTIMIZED pipeline ({mode_desc}) processing from {input_path}")
        
        if not self.use_batch_processing:
            logger.info("Using unified processing: 1 API call per row instead of 5")
        else:
            logger.info(f"Using batch processing: 1 API call per {self.processing_batch_size} rows")
        
        # Load data
        try:
            df = pd.read_csv(input_path)
            logger.info(f"Loaded {len(df)} rows from {input_path}")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
        
        # Validate columns
        missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        # Add label column if missing
        if 'label' not in df.columns:
            df['label'] = ''
        
        # Process rows
        processed_rows = []
        
        if self.use_batch_processing:
            # Batch processing mode
            batch = []
            
            for idx in range(start_from, len(df)):
                row = df.iloc[idx]
                batch.append((row, idx))
                
                # Process batch when full or at end
                if len(batch) >= self.processing_batch_size or idx == len(df) - 1:
                    batch_results = self.process_batch(batch)
                    
                    for result in batch_results:
                        if result:
                            processed_rows.append(result)
                    
                    # Log progress
                    logger.info(f"Processed {idx + 1}/{len(df)} rows")
                    
                    # Clear batch
                    batch = []
        else:
            # Single-instance processing mode
            for idx in range(start_from, len(df)):
                row = df.iloc[idx]
                processed = self.process_row(row, idx)
                
                if processed:
                    processed_rows.append(processed)
                
                # Save checkpoint every BATCH_SIZE rows
                if (idx + 1) % BATCH_SIZE == 0:
                    logger.info(f"Processed {idx + 1}/{len(df)} rows")
        
        # Create DataFrame
        processed_df = pd.DataFrame(processed_rows)
        
        # Save output
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            mode_suffix = "batch" if self.use_batch_processing else "single"
            output_path = f"{OUTPUT_DIR}/processed_data_{mode_suffix}_{timestamp}.csv"
        
        processed_df.to_csv(output_path, index=False, encoding='utf-8-sig')
        logger.info(f"Saved processed data to {output_path}")
        
        # Print statistics
        self._print_statistics()
        
        return processed_df
    
    def _print_statistics(self):
        """Print processing statistics"""
        mode = "BATCH" if self.use_batch_processing else "SINGLE-INSTANCE"
        logger.info("\n" + "="*60)
        logger.info(f"PROCESSING STATISTICS (OPTIMIZED {mode} Pipeline)")
        logger.info("="*60)
        logger.info(f"Total rows processed: {self.stats['total_processed']}")
        logger.info(f"Code-switching handled: {self.stats['code_switching_handled']}")
        logger.info(f"Dialect translations: {self.stats['translated']}")
        logger.info(f"Auto-labeled: {self.stats['auto_labeled']}")
        logger.info(f"Errors encountered: {self.stats['errors']}")
        logger.info("-" * 60)
        
        if self.use_batch_processing:
            improvement = f"~{5 * self.processing_batch_size}x"
            logger.info(f"⚡ Speed Improvement: {improvement} faster (batch size: {self.processing_batch_size})")
        else:
            logger.info("⚡ Speed Improvement: ~5x faster")
        
        logger.info("="*60 + "\n")


def main():
    """Main entry point"""
    
    ## configuration
    input_file = 'algerian_tweets_merged.csv'              # Path to input CSV file
    output_file = None                    # Path to output CSV file (None = auto-generate)
    start_from = 0                        # Row index to start from
    use_batch = False                      # Enable batch processing mode (True/False)
    batch_size = 1                       # Batch size for batch processing
    
    # Create optimized pipeline
    pipeline = OptimizedPipeline(
        use_batch_processing=use_batch,
        processing_batch_size=batch_size
    )
    
    # Process dataset
    try:
        processed_df = pipeline.process_dataset(
            input_path=input_file,
            output_path=output_file,
            start_from=start_from
        )
        logger.info("Optimized pipeline completed successfully!")
        
        # Show label distribution
        # logger.info("\nLabel Distribution:")
        # print(processed_df['label'].value_counts())
        
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        raise


if __name__ == "__main__":
    main()
