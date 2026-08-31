export interface LegalRuleMasterItem {
  id: string;
  ruleCode: string;
  ruleNumber: string;
  title: string;
  actName: string;
  authority: string;
  category: 'lmpc_mandatory' | 'weights_measures' | 'consumer_protection' | 'fssai_food_safety' | 'origin_import' | 'misleading_claims' | 'standards_bis';
  categoryLabel: string;
  mandatoryFor: string;
  description: string;
  keyRequirements: string[];
  exemptions?: string[];
  penaltyProvision: string;
  statutoryReference: string;
  verificationMethod: string;
  effectiveDate: string;
  status: 'Active' | 'Amended' | 'Under Review';
}

export const LEGAL_RULES_MASTER: LegalRuleMasterItem[] = [
  {
    id: 'rule-lmpc-6-1-a',
    ruleCode: 'LMPC-R6-1A',
    ruleNumber: 'Rule 6(1)(a)',
    title: 'Name and Complete Postal Address of Manufacturer / Packer / Importer',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India',
    category: 'lmpc_mandatory',
    categoryLabel: 'LMPC Mandatory',
    mandatoryFor: 'All pre-packaged commodities sold, distributed, or delivered in India',
    description:
      'Every package shall bear the name and complete address of the manufacturer, or where the manufacturer is not the packer, the name and address of the manufacturer and packer, and for imported goods, the name and address of the importer with Country of Origin.',
    keyRequirements: [
      'Complete postal address including premises number, street name, city, state, and PIN code',
      'Clear qualification (e.g., "Manufactured by", "Packed by", "Marketed by", "Imported & Distributed by")',
      'If manufactured by a third party for a brand owner, both entities must be declared or the registered corporate address must be stated',
      'Address must allow a consumer to trace and correspond physically with the legal entity'
    ],
    exemptions: [
      'Packages with surface area less than 10 sq cm (where abbreviated declarations are permitted under Rule 26)'
    ],
    penaltyProvision: 'Section 36(1) of Legal Metrology Act, 2009: Fine up to ₹25,000 for first offence, ₹50,000 for second, and up to ₹1,00,000 or imprisonment up to 1 year for subsequent offences.',
    statutoryReference: 'Rule 6(1)(a) read with Rule 10, Packaged Commodities Rules 2011',
    verificationMethod: 'Automated OCR & Named Entity Recognition verification of complete postal address, PIN code format (6 digits), and manufacturer qualification prefix.',
    effectiveDate: '01 April 2011 (Amended 2017 & 2021)',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-6-1-b',
    ruleCode: 'LMPC-R6-1B',
    ruleNumber: 'Rule 6(1)(b)',
    title: 'Generic or Common Name of the Packaged Commodity',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Ministry of Consumer Affairs, Food & Public Distribution',
    category: 'lmpc_mandatory',
    categoryLabel: 'LMPC Mandatory',
    mandatoryFor: 'All pre-packaged goods containing single or multiple items',
    description:
      'The common or generic name of the commodity contained in the package must be prominently displayed on the Principal Display Panel (PDP) so the consumer readily knows the true nature and identity of the product.',
    keyRequirements: [
      'Must clearly state generic identity (e.g., "Basmati Rice", "Bathing Soap", "Smartphone", "Detergent Powder")',
      'For packages containing more than one commodity, generic name and quantity of each must be listed',
      'Cannot be obscured by brand slogans, artistic logos, or marketing superlatives'
    ],
    penaltyProvision: 'Section 36(1) of Legal Metrology Act, 2009: Compoundable fine up to ₹25,000 for initial non-declaration.',
    statutoryReference: 'Rule 6(1)(b), Legal Metrology (Packaged Commodities) Rules 2011',
    verificationMethod: 'Visual OCR extraction from Principal Display Panel (PDP) and validation against statutory generic goods taxonomy.',
    effectiveDate: '01 April 2011',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-6-1-c',
    ruleCode: 'LMPC-R6-1C',
    ruleNumber: 'Rule 6(1)(c) & Rule 7',
    title: 'Net Quantity in Standard SI Metric Units (Weight, Measure or Number)',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Legal Metrology Division, Department of Consumer Affairs',
    category: 'weights_measures',
    categoryLabel: 'Weights & Measures',
    mandatoryFor: 'All packaged commodities measured by mass, volume, length, area, or count',
    description:
      'The net quantity in terms of standard unit of weight or measure (SI metric system) or number of units contained in the package must be clearly declared on the Principal Display Panel.',
    keyRequirements: [
      'Must use standard metric symbols: g, kg, ml, L, m, cm, mm, N (Units)',
      'Symbols like "gms", "grm", "kilo", "ltrs" are strictly non-compliant; standard ISO symbols must be used',
      'No misleading qualification like "Net Weight when packed", "Approximate", "Gross"',
      'Font height must comply with Rule 7 Schedule (e.g., min 1mm to 6mm depending on net quantity and area of PDP)'
    ],
    exemptions: [
      'Packages weighing less than 10g or 10ml sold in loose sachets (Rule 26 exemptions)'
    ],
    penaltyProvision: 'Section 36(2) of LM Act 2009: Non-standard units / short measure penalty up to ₹50,000 or imprisonment.',
    statutoryReference: 'Rule 6(1)(c), Rule 7, Rule 11, and Second Schedule of LMPC Rules 2011',
    verificationMethod: 'Regex & Natural Language parsing for valid SI metric units, correct symbol typography, and absence of prohibited qualifiers.',
    effectiveDate: '01 April 2011 (Amended 2022 for unit font sizes)',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-6-1-d',
    ruleCode: 'LMPC-R6-1D',
    ruleNumber: 'Rule 6(1)(d)',
    title: 'Maximum Retail Price (MRP) Inclusive of All Taxes',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Department of Consumer Affairs, Government of India',
    category: 'lmpc_mandatory',
    categoryLabel: 'LMPC Mandatory',
    mandatoryFor: 'All retail pre-packaged goods sold to consumers across India',
    description:
      'The maximum retail price at which the package may be sold to the ultimate consumer must be clearly stated in Indian Rupees with the mandatory phrase "Inclusive of all taxes" or "Incl. of all taxes".',
    keyRequirements: [
      'Format must be "MRP ₹ xx.xx (inclusive of all taxes)" or "MRP Rs. xx.xx (incl. of all taxes)"',
      'Overprinting, dual MRPs, or smudging of original price is strictly prohibited by law',
      'Must include all central, state, and local taxes (GST, Cess, etc.)',
      'Currency symbol ₹ (INR) or Rs. must precede or accompany the numeral'
    ],
    exemptions: [
      'Packages meant exclusively for institutional or industrial consumers under Rule 3',
      'Commodities packed for export under Rule 34'
    ],
    penaltyProvision: 'Section 36(1) of LM Act 2009 & Consumer Protection Act 2019: Mandatory penalty up to ₹50,000 for dual/unclear MRP.',
    statutoryReference: 'Rule 6(1)(d) & Rule 18, Legal Metrology (Packaged Commodities) Rules 2011',
    verificationMethod: 'OCR extraction of price numerals, INR currency token, and automated text matching for tax inclusion statement.',
    effectiveDate: '01 April 2011 (Amended 01 Jan 2018 for mandatory GST inclusion)',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-6-1-e',
    ruleCode: 'LMPC-R6-1E',
    ruleNumber: 'Rule 6(1)(e)',
    title: 'Month and Year of Manufacture, Packaging, or Import',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Ministry of Consumer Affairs',
    category: 'lmpc_mandatory',
    categoryLabel: 'LMPC Mandatory',
    mandatoryFor: 'All pre-packaged commodities',
    description:
      'The month and year in which the commodity is manufactured or pre-packed or imported shall be clearly indicated on the label so consumers can evaluate freshness and vintage.',
    keyRequirements: [
      'Format should state month and year (e.g., "08/2026", "Aug 2026", "08/26", or "Packed on Aug 2026")',
      'For cosmetics or perishables with short shelf life, exact date, month, and year may be required',
      'Must be clearly legible and indelible (laser etched, stamped, or printed ink)'
    ],
    exemptions: [
      'Certain agricultural seeds in specific bulk containers',
      'Incandescent lamps and certain electronic hardware components'
    ],
    penaltyProvision: 'Section 36(1) of LM Act 2009: Statutory fine up to ₹25,000 for absent or smudged date declaration.',
    statutoryReference: 'Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules 2011',
    verificationMethod: 'Date parsing engine verifying month/year token patterns and validating against current calendar limits.',
    effectiveDate: '01 April 2011',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-6-11-usp',
    ruleCode: 'LMPC-R6-USP',
    ruleNumber: 'Rule 6(11)',
    title: 'Unit Sale Price (USP) Declaration per Gram / Millilitre / Metre / Unit',
    actName: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2021',
    authority: 'Ministry of Consumer Affairs, Food & Public Distribution',
    category: 'weights_measures',
    categoryLabel: 'Weights & Measures',
    mandatoryFor: 'Pre-packaged commodities where net quantity is greater or lesser than 1 kg / 1 L / 1 m / 1 Unit',
    description:
      'To enable direct price comparison across differing package sizes, manufacturers must declare the Unit Sale Price (USP) in Rupees and Paise per standard unit (₹ per g / ₹ per ml / ₹ per unit) in close proximity to the MRP.',
    keyRequirements: [
      'If net weight < 1 kg: declared per gram (e.g., "₹ 0.40 / g")',
      'If net weight > 1 kg: declared per kilogram (e.g., "₹ 120.00 / kg")',
      'If net volume < 1 L: declared per millilitre (e.g., "₹ 0.85 / ml")',
      'If net volume > 1 L: declared per litre (e.g., "₹ 95.00 / L")',
      'If commodity is sold by number: declared per item / piece (e.g., "₹ 5.50 / unit")',
      'USP must be rounded off to the nearest two decimal places'
    ],
    exemptions: [
      'Packages where net quantity is exactly equal to 1 kg, 1 litre, 1 metre, or 1 number'
    ],
    penaltyProvision: 'Legal Metrology Rules 2021 Notification: Statutory non-compliance notice under Section 36(1).',
    statutoryReference: 'Rule 6(11) inserted vide GSR 779(E) dated 02.11.2021',
    verificationMethod: 'Mathematical cross-check: calculates MRP ÷ Net Quantity to verify if detected USP matches computed unit price within 2% margin.',
    effectiveDate: '01 December 2022',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-6-1-g',
    ruleCode: 'LMPC-R6-1G',
    ruleNumber: 'Rule 6(1)(g)',
    title: 'Consumer Care & Grievance Redressal Contact Details',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Department of Consumer Affairs, Government of India',
    category: 'consumer_protection',
    categoryLabel: 'Consumer Protection',
    mandatoryFor: 'All pre-packaged commodities sold in Indian consumer markets',
    description:
      'Every package must declare the name, postal address, telephone number, and email address of the person or office that can be contacted by consumers in case of complaints, defect, or grievance.',
    keyRequirements: [
      'Must provide: (1) Officer / Executive title or designation, (2) Postal address, (3) Telephone / Toll-free helpline number, (4) Active email address',
      'Should state: "For consumer complaints, contact Executive at [Address], Tel: [Phone], Email: [Email]"',
      'Website alone is NOT sufficient — both telephone and email are mandatory'
    ],
    penaltyProvision: 'Section 36(1) of LM Act 2009 & Consumer Protection (E-Commerce) Rules 2020: Fines up to ₹25,000.',
    statutoryReference: 'Rule 6(1)(g), Legal Metrology (Packaged Commodities) Rules 2011',
    verificationMethod: 'Multi-field entity extraction scanning for valid phone number regex (+91 / 1800 toll free), RFC email regex, and postal contact address.',
    effectiveDate: '01 April 2011 (Enhanced by Consumer Protection Act 2019)',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-6-1-h',
    ruleCode: 'LMPC-R6-1H',
    ruleNumber: 'Rule 6(1)(h)',
    title: 'Country of Origin Declaration',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Ministry of Consumer Affairs, Food & Public Distribution',
    category: 'origin_import',
    categoryLabel: 'Origin & Import',
    mandatoryFor: 'All imported as well as domestically produced packaged commodities',
    description:
      'The name of the Country of Origin or manufacture or assembly must be clearly declared on the package or label to ensure transparency of manufacturing provenance.',
    keyRequirements: [
      'Must declare phrase: "Country of Origin: India" or "Made in [Country]" or "Imported from [Country]"',
      'For assembled items with parts from multiple origins, the country where final assembly / substantial transformation occurred must be stated',
      'Must not use ambiguous acronyms unless standard ISO country codes'
    ],
    penaltyProvision: 'Section 36(1) LM Act 2009 & Customs Act: Non-clearance of cargo and statutory penal action.',
    statutoryReference: 'Rule 6(1)(h) inserted vide GSR 629(E) dated 23.06.2017',
    verificationMethod: 'Country gazetteer matching algorithm scanning for ISO 3166 country names and standard "Made in / Origin" keywords.',
    effectiveDate: '01 January 2018',
    status: 'Active',
  },
  {
    id: 'rule-fssai-2-3',
    ruleCode: 'FSSAI-R2-3',
    ruleNumber: 'FSSAI Reg 2.3 & 2.4',
    title: '14-Digit FSSAI License Number and Food Safety Logo',
    actName: 'Food Safety and Standards (Packaging and Labelling) Regulations, 2011 & 2020',
    authority: 'Food Safety and Standards Authority of India (FSSAI), MoHFW',
    category: 'fssai_food_safety',
    categoryLabel: 'FSSAI Food Safety',
    mandatoryFor: 'All pre-packaged food and beverage products manufactured, packed, or sold in India',
    description:
      'All food business operators (FBOs) must display the statutory FSSAI logo along with their 14-digit FSSAI License or Registration Number on the Principal Display Panel of the food packaging.',
    keyRequirements: [
      'Statutory FSSAI logo format with 14-digit numeric license number underneath (e.g., "Lic. No. 10019011006543")',
      'If multiple packaging units / brand owner and third party manufacturer exist, license numbers of both must be displayed',
      'Veg / Non-Veg statutory green square/circle or brown triangle/circle symbol on front of pack'
    ],
    exemptions: [
      'Non-food industrial commodities, electronics, textiles, and hardware'
    ],
    penaltyProvision: 'Section 58 of Food Safety & Standards Act, 2006: Penalty for manufacturing without license up to ₹5,00,000 and 6 months imprisonment.',
    statutoryReference: 'FSS (Packaging and Labelling) Regulations, 2011 / FSS (Labelling and Display) Regulations, 2020',
    verificationMethod: '14-digit numeric regex pattern validation with Luhn-like state code prefix checking and food category contextual gate.',
    effectiveDate: '05 August 2011 (Updated 2020 Display Regulations)',
    status: 'Active',
  },
  {
    id: 'rule-lmpc-rule-9',
    ruleCode: 'LMPC-R9',
    ruleNumber: 'Rule 9(1)',
    title: 'Principal Display Panel (PDP) Dimensions and Placement',
    actName: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    authority: 'Ministry of Consumer Affairs',
    category: 'standards_bis',
    categoryLabel: 'Standards & Formatting',
    mandatoryFor: 'All pre-packaged commodities requiring display panels',
    description:
      'All statutory declarations required under Rule 6 shall be grouped together on the Principal Display Panel (PDP) and shall be clearly legible, prominent, in definite contrast to the background, and unobstructed.',
    keyRequirements: [
      'For rectangular packages: PDP area is at least 40% of total height × width of the principal face',
      'For cylindrical / conical containers: PDP area is at least 20% of total surface area',
      'Declarations cannot be placed on bottom surface unless container has no other flat face',
      'Font color must contrast with background (e.g., dark text on light background or vice versa)'
    ],
    penaltyProvision: 'Section 36(1) of LM Act 2009: Rejection of label layout and compounding fine.',
    statutoryReference: 'Rule 9(1) and Rule 9(2), Legal Metrology Rules 2011',
    verificationMethod: 'Computer vision color contrast ratio analysis (WCAG 4.5:1 min) and bounding box spatial clustering verification.',
    effectiveDate: '01 April 2011',
    status: 'Active',
  },
  {
    id: 'rule-cpa-sec-10',
    ruleCode: 'CPA-S10',
    ruleNumber: 'Section 10 & 21',
    title: 'Prohibition of Misleading Declarations & Deceptive Packaging Claims',
    actName: 'Consumer Protection Act, 2019 & CCPA Guidelines 2022',
    authority: 'Central Consumer Protection Authority (CCPA)',
    category: 'misleading_claims',
    categoryLabel: 'Misleading Claims',
    mandatoryFor: 'All consumer products and commercial packaging advertisements',
    description:
      'Packages must not make false or misleading claims regarding efficacy, provenance, organic status, awards, ingredients, or therapeutic benefits without verified certification.',
    keyRequirements: [
      'Claims like "100% Natural", "Organic", "Clinically Proven" must cite valid laboratory test or certifying agency (e.g., Jaivik Bharat / AYUSH / NABL)',
      'Slack fill (excessive empty headspace in packaging designed to mislead consumers regarding volume) is prohibited',
      'Disclaimers must be in clear font, not tiny illegible micro-text'
    ],
    penaltyProvision: 'Section 21 of Consumer Protection Act, 2019: CCPA can impose penalties up to ₹10,00,000 on manufacturers and ₹50,00,000 for repeated violations.',
    statutoryReference: 'Section 10(1), 21(1) of Consumer Protection Act 2019 and CCPA Prevention of Misleading Advertisements Guidelines 2022',
    verificationMethod: 'Natural language analysis identifying unsubstantiated superlatives, uncertified greenwashing claims, and missing certification logos.',
    effectiveDate: '20 July 2020 (CCPA Guidelines 09 June 2022)',
    status: 'Active',
  },
  {
    id: 'rule-bis-act-16',
    ruleCode: 'BIS-ACT-16',
    ruleNumber: 'Section 16',
    title: 'Mandatory ISI Standard Mark for Compulsory Certification Items',
    actName: 'Bureau of Indian Standards Act, 2016 & QCO Notifications',
    authority: 'Bureau of Indian Standards (BIS), Ministry of Consumer Affairs',
    category: 'standards_bis',
    categoryLabel: 'Standards & Certification',
    mandatoryFor: 'Packaged Drinking Water, Infant Milk Food, Helmets, Electronics (CRS), Toys, Cement, and Steel',
    description:
      'Commodities notified under Quality Control Orders (QCO) cannot be manufactured, imported, stored, or sold without the BIS Standard Mark (ISI mark) and a valid CM/L (Certification Marks/License) number.',
    keyRequirements: [
      'Standard ISI Logo with Indian Standard Number (e.g., "IS:14543") on top and 7/8-digit CM/L license number below',
      'For Electronics & IT Goods: BIS CRS Registration Mark with "R-XXXXXXXX" number',
      'Must not use simulated or fake ISI marks'
    ],
    exemptions: [
      'Goods not covered under mandatory Quality Control Orders (QCOs)'
    ],
    penaltyProvision: 'Section 29 of BIS Act, 2016: Imprisonment up to 2 years or fine not less than ₹2,00,000 up to 10 times value of goods.',
    statutoryReference: 'Section 16, 17, and 29 of Bureau of Indian Standards Act, 2016',
    verificationMethod: 'BIS ISI Mark visual logo classification and CM/L license number regex validation.',
    effectiveDate: '12 October 2017',
    status: 'Active',
  }
];
