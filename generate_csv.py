import pandas as pd

data = {
    'Scheme_ID': ['PM-001', 'AY-202', 'SSY-303', 'AWA-404'],
    'Scheme_Name': ['PM Kisan Samman Nidhi', 'Ayushman Bharat - PMJAY', 'Sukanya Samriddhi Yojana', 'PMAY - Gramin'],
    'Benefit_Amount': ['6000 per year', '5 Lakh per family', '7.6% Interest Rate', '1.2 Lakh for house'],
    'Eligibility_Criteria': [
        'Small and marginal farmers with landholdings',
        'Low income families identified in SECC 2011',
        'Parents of girl child below 10 years',
        'Families living in kutcha houses or homeless'
    ],
    'Department': ['Ministry of Agriculture', 'Ministry of Health', 'Department of Posts', 'Ministry of Rural Development'],
    'Required_Documents': [
        'Aadhaar Card;Land Records;Bank Passbook',
        'Ration Card;Aadhaar Card',
        'Birth Certificate;Parent ID Proof',
        'Aadhaar;Voter ID;MGNREGA Job Card'
    ]
}

df = pd.DataFrame(data)
df.to_csv('govt_schemes_test.csv', index=False)
print("✅ govt_schemes_test.csv has been created successfully!")