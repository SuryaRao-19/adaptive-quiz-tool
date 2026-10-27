# Gradebook Exports, QTI Interoperability & Growth Certificates

## 1. Gradebook CSV Export

### 1.1 Formula Injection Protection (CSV Injection / DDE)
When exporting student gradebooks to CSV, cells beginning with `= `, `+`, `-`, `@`, `\t`, or `\r` can trigger formula execution in spreadsheet software like Microsoft Excel or LibreOffice Calc.
AdaptIQ automatically sanitizes all fields:
```javascript
if (/^[=+\-@\t\r]/.test(str)) {
  return `'${str}`;
}
```

### 1.2 Leading Zero Preservation
Student roll numbers (e.g. `'007'`) are escaped as formula text strings `="007"` in the CSV output so spreadsheet viewers treat them as strings rather than integer `7`.

### 1.3 Normalized Learning Gain Calculation
$$g = \frac{\text{Post} - \text{Pre}}{100 - \text{Pre}}$$
- **Pre = 100%**: Denominator is zero; output is labeled `"N/A (Pre-test 100%)"`.
- **Missing Pre or Post**: Labeled `"N/A"`.
- **Negative Gains**: Accurately reported when post-test is lower than pre-test (e.g. `-15.0%`).

---

## 2. IMS QTI v2.1 Assessment Package Export
AdaptIQ exports question bank items into standardized IMS Question & Test Interoperability (QTI) v2.1 XML packages:
- Encapsulates `<assessmentItem>` with `<responseDeclaration>`, `<outcomeDeclaration>`, `<itemBody>`, and `<responseProcessing>`.
- Enables direct import into Canvas, Moodle, Blackboard, and Google Classroom.

---

## 3. Printable Student Growth Certificate
Accessible from `AnalyticsHub.jsx` and `TestMode.jsx`:
- Features a printable academic certificate (`<GrowthCertificateModal />`).
- Displays Student Name, Roll Number, Baseline Pre-test Score, Final Post-test Score, and Normalized Learning Gain $g$.
- Styled with `@media print` directives for clean physical printouts on standard letter/A4 paper.
