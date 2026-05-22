function parseAIResponse(aiResponse) {
  const lines = aiResponse.split('\n');
  return {
    primaryDiagnosis: lines.find(line => line.toLowerCase().includes('diagnosis'))?.split(':')[1]?.trim() || 'Unspecified',
    confidenceLevel: parseInt(lines.find(line => line.toLowerCase().includes('confidence'))?.match(/\d+/)?.[0] || '0'),
    additionalFindings: lines.find(line => line.toLowerCase().includes('additional findings'))?.split(':')[1]?.split(',').map(s => s.trim()) || [],
    recommendedActions: lines.find(line => line.toLowerCase().includes('recommended actions'))?.split(':')[1]?.trim() || 'Consult with a specialist for further evaluation.'
  };
}

module.exports = {
  parseAIResponse
};
