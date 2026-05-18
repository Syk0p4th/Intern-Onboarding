# Receipt Categoriser — Feature Spec v0.1

## 1. Why
- The user / business outcome we are solving
Business spends significant effort to manually reviewing the expense claims because receipts arrive without no category information. Introduce AI-assisted anaysis the uploaded the receipt image and suggest one of the five standard expence categories. The claiment review and accept or change the suggested change before submitting the claim
- The metric this feature is expected to move

Average manual review time per claim usually 4 min and get it down to at least 90 seconds 
70% of claims auto categorise with confidence level <0.6 
Category correction rate is >15% 
These expected success rate should be monited over 90 days 

## 2. Scope
- In scope (1-3 bullets)
Real-time image categorisation triggered at the claim submission
Standard Categorise classes - Meals, Travel, Lodging, Office supplies, and other
any prediction with under 0.6 confidence score reviewed by the claiment before submission

- Affects which containers / services from Day 4
Claims submission API - New endpoint is added POST claims/{id}/category
Receipt categoriser - Using OpenAI (gpt-4.1) new service from Azure OpenAI and Receipt OCR using Azure AI Document Intelligence 
Azure application insights - Receive customEvent - receipt.categorized 


## 3. Contract
### Inputs
- Receipt image (jpeg/png, <= 10 MB) plus claim ID
### Outputs
- { category: enum, confidence: float, source: "llm" | "rule-based" }
### Errors
- 400: bad input, 413: too large, 502: upstream OCR/LLM unavailable
### Side effects
- Application Insights customEvent emitted

## 4. Acceptance criteria
- The 413 is returned only when the file is too large than 5MB
- The confidence level is a float between 0 and 1 any number over or under those limit is a test failure 
- only trigger needsReview when the the confidence score is under 0.6 LLM switch to rule-based  
- the 400 is returned only when the uploaded file is not a png,jpeg for example pdf

## 5. Examples
- At least 3 in/out examples (happy, ambiguous, error)

(Happy)
input 
claimId-{1472648sfg} img - taxi_receipt{Travel,2.4Mb}
Output - {"Travel" , Confidence Score "0.9", source "llm", needsReview "false"}
Notes - Confidence score is well over 0.6 and automatically filled the category and claiment can click the accept 

(Ambiguous)
input
Claimid - {123512ahy} img - blurry_shop.png{Convenience Store, 1.2Mb}
Output - {"Office supplies", Confidence Score "0.4", source "llm" , needsReview "true"}
Note - confidence score is below 0.6 so the needReview is true and the claiment accept or change the given output.

(Error)
Input
claimId - {152372aef} img - High_res_scan.jpeg(13Mb)
output - HTTP 413 { Error "File too large", Max Size "5MB"}
Note - Client should prompt the user to compress file and re upload it again 


## 6. Out of scope
- Multi-receipt batch upload
- Auto-submission without claimant confirmation
- Currency extraction and amount extraction
- Active Learning from the claiment information


## 7. Open questions
- What confidence threshold should trigger "Needs review"?
- Do we want to learn from overrides (active learning) in v1?
- Do we want to capture the events so finance can audit which categories get overridden and by whom?
