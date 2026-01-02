import { analyzeText, getVerdictStyle, formatPartitionForChart, formatConfidence } from './services/analyze.js';

console.log('\n' + '='.repeat(80));
console.log('TESTING ANALYZE SERVICE');
console.log('='.repeat(80) + '\n');

// Analyze text
console.log('Analyzing query: "كيف حالة الطقس اليوم؟"...\n');
const result = await analyzeText("كيف حالة الطقس اليوم؟", { k: 3, threshold: 0.35 });

console.log('--- ORIGINAL CONTENT ---');
console.log(result.original_content);

console.log('\n--- VERDICT ---');
const style = getVerdictStyle(result.verdict.label);
console.log(`Label: ${result.verdict.label} ${style.icon}`);
console.log(`Description: ${result.verdict.description}`);
console.log(`Confidence: ${formatConfidence(result.verdict.confidence)}`);
console.log(`Color: ${style.color}`);

console.log('\n--- PARTITION (Probabilities) ---');
const chartData = formatPartitionForChart(result.partition);
chartData.forEach(item => {
    console.log(`${item.label}: ${item.percentage} (${item.color})`);
});

console.log('\n--- DETECTION REASONING ---');
if (result.detection_reasoning && result.detection_reasoning.length > 0) {
    result.detection_reasoning.forEach((reason, i) => {
        console.log(`${i + 1}. ${reason.title}`);
        console.log(`   ${reason.description}`);
    });
} else {
    console.log('No detection reasoning provided');
}

console.log('\n--- LINGUISTIC PROFILE ---');
const profile = result.linguistic_profile || {};
console.log(`Dialect: ${profile.dialect || 'N/A'}`);
console.log(`Emotional Level: ${profile.emotional_level || 'N/A'}`);
console.log(`Cited Sources: ${profile.cited_sources || 0}`);
console.log(`Factual Claims: ${profile.factual_claims || 0}`);
console.log(`Language: ${profile.language || 'N/A'}`);

console.log('\n--- DOCUMENTS ---');
console.log(`Retrieved: ${result.documents_retrieved}`);
if (result.documents && result.documents.length > 0) {
    result.documents.forEach((doc, i) => {
        console.log(`\n${i + 1}. ${doc.content.substring(0, 150)}...`);
        if (doc.metadata && Object.keys(doc.metadata).length > 0) {
            console.log(`   Metadata: ${JSON.stringify(doc.metadata)}`);
        }
    });
}

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80) + '\n');