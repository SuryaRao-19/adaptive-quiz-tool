/**
 * IMS QTI v2.1 Exporter Utility
 * Generates standards-compliant XML assessmentItems from question records.
 */

function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate IMS QTI v2.1 Assessment XML Package
 * @param {Array} questions - Array of question records
 * @param {string} title - Assessment title
 * @returns {string} XML string conforming to IMS QTI v2.1
 */
function generateQtiXml(questions = [], title = 'AdaptIQ Assessment') {
  const items = questions.map((q, idx) => {
    const itemId = q._id ? q._id.toString() : `item_${idx + 1}`;
    const correctIdx = q.correctAnswerIndex ?? q.correctIndex ?? 0;
    const correctIdentifier = `Choice${String.fromCharCode(65 + correctIdx)}`;

    const choicesXml = (q.options || []).map((opt, oIdx) => {
      const choiceId = `Choice${String.fromCharCode(65 + oIdx)}`;
      return `        <simpleChoice identifier="${choiceId}">${escapeXml(opt)}</simpleChoice>`;
    }).join('\n');

    return `  <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
                  identifier="${itemId}"
                  title="${escapeXml(q.topic || 'STEM Assessment Item')}"
                  adaptive="false"
                  timeDependent="false">
    <responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier">
      <correctResponse>
        <value>${correctIdentifier}</value>
      </correctResponse>
    </responseDeclaration>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue>
        <value>0</value>
      </defaultValue>
    </outcomeDeclaration>
    <itemBody>
      <p>${escapeXml(q.questionText)}</p>
      <choiceInteraction responseIdentifier="RESPONSE" shuffle="false" maxChoices="1">
${choicesXml}
      </choiceInteraction>
    </itemBody>
    <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
    <modalFeedback outcomeIdentifier="FEEDBACK" identifier="EXPLANATION" showHide="show">
      <p>${escapeXml(q.explanation || '')}</p>
    </modalFeedback>
  </assessmentItem>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.imsglobal.org/xsd/imsqti_v2p1 http://www.imsglobal.org/xsd/qti/qtiv2p1/imsqti_v2p1.xsd"
                identifier="test_${Date.now()}"
                title="${escapeXml(title)}">
${items}
</assessmentTest>`;
}

module.exports = {
  escapeXml,
  generateQtiXml
};
