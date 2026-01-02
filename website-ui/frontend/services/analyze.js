/**
 * Analyze Service - RAG Analysis API Integration
 * Connects to the RAG API for comprehensive news analysis
 */

const RAG_API_BASE_URL = 'http://localhost:8001';

/**
 * @typedef {Object} Verdict
 * @property {string} label - Classification label (Not_fake, fake, satire, not_news)
 * @property {string} description - Human-readable description
 * @property {number} confidence - Confidence score (0-1)
 */

/**
 * @typedef {Object} Partition
 * @property {number} Not_fake - Probability of being real news
 * @property {number} fake - Probability of being fake news
 * @property {number} satire - Probability of being satire
 * @property {number} not_news - Probability of not being news
 */

/**
 * @typedef {Object} DetectionReason
 * @property {string} title - Short title for the detection indicator
 * @property {string} description - Explanation of this indicator
 */

/**
 * @typedef {Object} LinguisticProfile
 * @property {string} dialect - Detected dialect (e.g., "Algerian Darja", "Standard Arabic")
 * @property {string} emotional_level - Emotional intensity (Low, Medium, High)
 * @property {number} cited_sources - Number of sources cited
 * @property {number} factual_claims - Number of factual claims made
 * @property {string} language - Language code (ar, fr, etc.)
 */

/**
 * @typedef {Object} Document
 * @property {string} content - Document content
 * @property {Object} metadata - Document metadata
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {string} original_content - The original query/text
 * @property {Verdict} verdict - LLM's classification verdict (independent from classifier)
 * @property {Partition} partition - LLM's probability distribution (independent assessment)
 * @property {Object} classifier_reference - Original classifier results for reference
 * @property {DetectionReason[]} detection_reasoning - List of detection reasons
 * @property {LinguisticProfile} linguistic_profile - Linguistic analysis
 * @property {number} documents_retrieved - Number of documents retrieved
 * @property {Document[]} documents - Retrieved documents
 */

/**
 * Analyze a query/text using the RAG system
 * 
 * @param {string} query - The text/query to analyze
 * @param {Object} options - Analysis options
 * @param {number} options.k - Number of documents to retrieve (default: 4)
 * @param {number} options.threshold - Similarity threshold (default: 0.35)
 * @returns {Promise<AnalysisResult>} - The analysis result
 * @throws {Error} - If the API request fails
 */
export async function analyzeText(query, options = {}) {
    const { k = 4, threshold = 0.35 } = options;

    try {
        const response = await fetch(`${RAG_API_BASE_URL}/ai/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                k,
                threshold,
                return_all_scores: true
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || 
                errorData.message || 
                `API request failed with status ${response.status}`
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Analysis error:', error);
        throw new Error(`Failed to analyze text: ${error.message}`);
    }
}

/**
 * Analyze a query using GET method (for simple queries)
 * 
 * @param {string} query - The text/query to analyze
 * @param {Object} options - Analysis options
 * @param {number} options.k - Number of documents to retrieve (default: 4)
 * @param {number} options.threshold - Similarity threshold (default: 0.35)
 * @returns {Promise<AnalysisResult>} - The analysis result
 */
export async function analyzeTextGet(query, options = {}) {
    const { k = 4, threshold = 0.35 } = options;

    try {
        const params = new URLSearchParams({
            query,
            k: k.toString(),
            threshold: threshold.toString(),
            return_all_scores: 'true'
        });

        const response = await fetch(
            `${RAG_API_BASE_URL}/ai/generate?${params.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || 
                errorData.message || 
                `API request failed with status ${response.status}`
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Analysis error:', error);
        throw new Error(`Failed to analyze text: ${error.message}`);
    }
}

/**
 * Get formatted verdict label with color coding
 * 
 * @param {string} label - The verdict label
 * @returns {Object} - Object with label, color, and icon
 */
export function getVerdictStyle(label) {
    const styles = {
        'Not_fake': {
            label: 'Real News',
            color: '#4CAF50',
            bgColor: '#E8F5E9',
            icon: '✓'
        },
        'fake': {
            label: 'Fake News',
            color: '#F44336',
            bgColor: '#FFEBEE',
            icon: '✗'
        },
        'satire': {
            label: 'Satire',
            color: '#FF9800',
            bgColor: '#FFF3E0',
            icon: '😄'
        },
        'not_news': {
            label: 'Not News',
            color: '#9E9E9E',
            bgColor: '#F5F5F5',
            icon: 'ℹ'
        }
    };

    return styles[label] || styles['not_news'];
}

/**
 * Format confidence percentage
 * 
 * @param {number} confidence - Confidence value (0-1)
 * @returns {string} - Formatted percentage
 */
export function formatConfidence(confidence) {
    return `${(confidence * 100).toFixed(1)}%`;
}

/**
 * Get confidence level label
 * 
 * @param {number} confidence - Confidence value (0-1)
 * @returns {string} - Confidence level (Low, Medium, High)
 */
export function getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
}

/**
 * Format partition data for charts
 * 
 * @param {Partition} partition - The partition object
 * @returns {Array} - Array of chart data objects
 */
export function formatPartitionForChart(partition) {
    return Object.entries(partition).map(([label, value]) => ({
        label: getVerdictStyle(label).label,
        value: value * 100,
        percentage: formatConfidence(value),
        color: getVerdictStyle(label).color
    }));
}

/**
 * Check if API is healthy
 * 
 * @returns {Promise<boolean>} - True if API is healthy
 */
export async function checkAPIHealth() {
    try {
        const response = await fetch(`${RAG_API_BASE_URL}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.status === 'healthy';
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
}

/**
 * Get available API routes
 * 
 * @returns {Promise<string[]>} - List of available routes
 */
export async function getAPIRoutes() {
    try {
        const response = await fetch(`${RAG_API_BASE_URL}/`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.routes || [];
    } catch (error) {
        console.error('Failed to get routes:', error);
        return [];
    }
}

// Export default object with all functions
export default {
    analyzeText,
    analyzeTextGet,
    getVerdictStyle,
    formatConfidence,
    getConfidenceLevel,
    formatPartitionForChart,
    checkAPIHealth,
    getAPIRoutes
};
