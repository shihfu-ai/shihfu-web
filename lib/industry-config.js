// lib/industry-config.js
// Single source of truth for all industry-specific form fields, service types,
// and retention trigger fields. This drives the Add Customer form, Log Service
// modal, and signup dropdowns — any change here propagates everywhere.
//
// Pattern: Customer -> Asset -> Service Event -> Retention Triggers
//
// Usage:
//   import { INDUSTRY_CONFIG, getConfig } from '@/lib/industry-config'
//   const config = getConfig('veterinary')  // returns the full config object

// ─── Vertical keys ────────────────────────────────────────────────
// These are the string values stored in the `businesses.vertical` column
// and in localStorage under staff.vertical after login.
//
// auto_repair | veterinary | salon_spa | home_cleaning |
// ac_maintenance | pest_control | healthcare_eye | healthcare_dental |
// fitness_wellness | real_estate

export const VERTICALS = [
  { value: 'auto_repair',       label: 'Auto Repair and Garage' },
  { value: 'veterinary',        label: 'Veterinary and Pet Services' },
  { value: 'salon_spa',         label: 'Salon and Spa' },
  { value: 'home_cleaning',     label: 'Home Cleaning and Management' },
  { value: 'ac_maintenance',    label: 'AC Maintenance and Service' },
  { value: 'pest_control',      label: 'Pest Control Services' },
  // Healthcare is one dropdown entry at signup; sub-type selected in dashboard
  { value: 'healthcare_eye',    label: 'Healthcare — Eye Clinic' },
  { value: 'healthcare_dental', label: 'Healthcare — Dental Clinic' },
  { value: 'fitness_wellness',  label: 'Fitness and Wellness' },
  { value: 'real_estate',       label: 'Real Estate' },
];

// Shown at signup — Healthcare is a single grouped entry
export const SIGNUP_VERTICALS = [
  { value: 'auto_repair',       label: 'Auto Repair and Garage' },
  { value: 'veterinary',        label: 'Veterinary and Pet Services' },
  { value: 'salon_spa',         label: 'Salon and Spa' },
  { value: 'home_cleaning',     label: 'Home Cleaning and Management' },
  { value: 'ac_maintenance',    label: 'AC Maintenance and Service' },
  { value: 'pest_control',      label: 'Pest Control Services' },
  { value: 'healthcare',        label: 'Healthcare and Clinics', isGroup: true,
    subTypes: [
      { value: 'healthcare_eye',    label: 'Eye Clinic' },
      { value: 'healthcare_dental', label: 'Dental Clinic' },
    ]
  },
  { value: 'fitness_wellness',  label: 'Fitness and Wellness' },
  { value: 'real_estate',       label: 'Real Estate' },
];

// ─── Full industry config ─────────────────────────────────────────
export const INDUSTRY_CONFIG = {

  // ── 1. AUTO REPAIR ──────────────────────────────────────────────
  auto_repair: {
    label: 'Auto Repair and Garage',
    assetLabel: 'Vehicle Details',
    assetName: 'Vehicle',

    assetFields: [
      { key: 'entityName',       label: 'Vehicle Nickname / Plate No.', type: 'text',   placeholder: 'e.g. MH12 AB1234', required: false },
      { key: 'make',             label: 'Make',                         type: 'text',   placeholder: 'e.g. Toyota, Honda, Maruti' },
      { key: 'model',            label: 'Model',                        type: 'text',   placeholder: 'e.g. Swift, Activa, Nexon' },
      { key: 'year',             label: 'Year of Manufacture',          type: 'text',   placeholder: 'e.g. 2019' },
      { key: 'fuelType',         label: 'Fuel Type',                    type: 'select', options: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid', 'LPG'] },
      { key: 'transmission',     label: 'Transmission',                 type: 'select', options: ['Manual', 'Automatic', 'CVT', 'AMT'] },
      { key: 'registrationNo',   label: 'Registration Number',          type: 'text',   placeholder: 'e.g. MH12 AB1234' },
      { key: 'color',            label: 'Color',                        type: 'text',   placeholder: 'e.g. White, Silver' },
      { key: 'currentMileage',   label: 'Current Mileage (km)',         type: 'text',   placeholder: 'e.g. 45000' },
      { key: 'lastServiceMileage', label: 'Last Service Mileage (km)',  type: 'text',   placeholder: 'e.g. 40000' },
    ],

    retentionFields: [
      { key: 'nextServiceDate',    label: 'Next Service Due Date',     type: 'date' },
      { key: 'nextServiceMileage', label: 'Next Service Due (km)',     type: 'text', placeholder: 'e.g. 50000' },
      { key: 'warrantyExpiry',     label: 'Warranty Expiry Date',      type: 'date' },
      { key: 'amcActive',          label: 'AMC / Service Package',     type: 'select', options: ['Yes', 'No'] },
      { key: 'amcExpiry',          label: 'AMC Expiry Date',           type: 'date' },
    ],

    serviceTypes: [
      'Oil Change',
      'General Service',
      'Brake Service',
      'AC Service and Gas Refill',
      'Car Wash',
      'Interior Cleaning',
      'Detailing',
      'Tyre Rotation and Replacement',
      'Battery Check and Replacement',
      'Insurance Renewal',
      'Engine Repair',
      'Suspension Work',
      'Electrical Repair',
      'Other',
    ],

    serviceFields: [
      { key: 'mileageAtService', label: 'Mileage at Service (km)', type: 'text', placeholder: 'e.g. 45000' },
      { key: 'partsReplaced',    label: 'Parts Replaced',          type: 'text', placeholder: 'e.g. Oil filter, brake pads' },
    ],

    automationTriggers: [
      'Oil change every 5000 km or 6 months',
      'General service every 6 months',
      'AC service before summer (March)',
      'Inactive customer — no visit in 6 months',
      'AMC renewal reminder',
      'Warranty expiry alert',
    ],
  },

  // ── 2. VETERINARY / PET SERVICES ───────────────────────────────
  veterinary: {
    label: 'Veterinary and Pet Services',
    assetLabel: 'Pet Details',
    assetName: 'Pet',

    assetFields: [
      { key: 'entityName',    label: 'Pet Name',                   type: 'text',   placeholder: 'e.g. Bruno, Whiskers', required: true },
      { key: 'petType',       label: 'Pet Type',                   type: 'select', options: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Guinea Pig', 'Fish', 'Reptile', 'Other'] },
      { key: 'breed',         label: 'Breed',                      type: 'text',   placeholder: 'e.g. Labrador, Persian, Pomeranian' },
      { key: 'gender',        label: 'Gender',                     type: 'select', options: ['Male', 'Female', 'Unknown'] },
      { key: 'dobOrAge',      label: 'Date of Birth / Age',        type: 'text',   placeholder: 'e.g. Jan 2020 or 3 years' },
      { key: 'weight',        label: 'Weight (kg)',                type: 'text',   placeholder: 'e.g. 12' },
      { key: 'neutered',      label: 'Neutered / Spayed',          type: 'select', options: ['Yes', 'No', 'Unknown'] },
      { key: 'colorMarkings', label: 'Color / Markings',           type: 'text',   placeholder: 'e.g. Black and white, tabby' },
      { key: 'allergies',     label: 'Known Allergies',            type: 'text',   placeholder: 'e.g. None, chicken protein' },
      { key: 'medicalNotes',  label: 'Medical Notes',              type: 'text',   placeholder: 'e.g. Diabetic, on medication' },
      { key: 'microchipId',   label: 'Microchip ID',               type: 'text',   placeholder: 'Optional' },
    ],

    retentionFields: [
      { key: 'nextVaccinationDate',  label: 'Next Vaccination Due',       type: 'date' },
      { key: 'nextDewormingDate',    label: 'Next Deworming Due',         type: 'date' },
      { key: 'nextGroomingDate',     label: 'Next Grooming Due',          type: 'date' },
      { key: 'nextCheckupDate',      label: 'Next Checkup Due',           type: 'date' },
      { key: 'medicationRefillDate', label: 'Medication Refill Date',     type: 'date' },
      { key: 'lastVaccineName',      label: 'Last Vaccine Given',         type: 'text', placeholder: 'e.g. Rabies, DHPPi' },
    ],

    serviceTypes: [
      'Vaccination',
      'Deworming',
      'Grooming — Full',
      'Grooming — Bath Only',
      'Grooming — Nail Trim',
      'General Checkup',
      'Surgery',
      'Medication',
      'Boarding',
      'Flea and Tick Treatment',
      'Dental Cleaning',
      'Food Purchase',
      'Emergency Visit',
      'Other',
    ],

    serviceFields: [
      { key: 'vaccineName',     label: 'Vaccine Name (if applicable)',  type: 'text', placeholder: 'e.g. Rabies, DHPPi, Leptospira' },
      { key: 'vetName',         label: 'Veterinarian Name',             type: 'text', placeholder: 'e.g. Dr. Priya Sharma' },
      { key: 'nextVaccineDue',  label: 'Next Vaccine Due Date',         type: 'date' },
      { key: 'weightAtVisit',   label: 'Weight at Visit (kg)',          type: 'text', placeholder: 'e.g. 12.5' },
    ],

    automationTriggers: [
      'Vaccination reminder (based on next due date)',
      'Deworming every 3 months',
      'Grooming every 30 to 45 days',
      'Annual checkup reminder',
      'Medication refill alert',
      'Inactive pet alert — no visit in 60 days',
    ],
  },

  // ── 3. SALONS AND SPAS ──────────────────────────────────────────
  salon_spa: {
    label: 'Salon and Spa',
    assetLabel: 'Client Profile',
    assetName: 'Client',

    assetFields: [
      { key: 'entityName',        label: 'Client Nickname (optional)',    type: 'text',   placeholder: 'e.g. Priya — short name for notes' },
      { key: 'gender',            label: 'Gender',                        type: 'select', options: ['Female', 'Male', 'Prefer not to say'] },
      { key: 'dob',               label: 'Date of Birth',                 type: 'date' },
      { key: 'hairType',          label: 'Hair Type',                     type: 'select', options: ['Straight', 'Wavy', 'Curly', 'Coily', 'Thin', 'Thick', 'Mixed'] },
      { key: 'skinType',          label: 'Skin Type',                     type: 'select', options: ['Normal', 'Oily', 'Dry', 'Combination', 'Sensitive'] },
      { key: 'preferredStylist',  label: 'Preferred Stylist',             type: 'text',   placeholder: 'e.g. Meera' },
      { key: 'preferredTimeSlot', label: 'Preferred Time Slot',           type: 'select', options: ['Morning (9am-12pm)', 'Afternoon (12pm-4pm)', 'Evening (4pm-8pm)', 'Any'] },
      { key: 'preferences',       label: 'Service Preferences / Notes',   type: 'text',   placeholder: 'e.g. Prefers sulfate-free products, no fragrance' },
    ],

    retentionFields: [
      { key: 'nextHaircutDue',     label: 'Next Haircut Due',             type: 'date' },
      { key: 'nextColorDue',       label: 'Next Hair Color Due',          type: 'date' },
      { key: 'nextFacialDue',      label: 'Next Facial / Cleanup Due',    type: 'date' },
      { key: 'nextWaxingDue',      label: 'Next Waxing Due',              type: 'date' },
      { key: 'nextTreatmentDue',   label: 'Next Skin Treatment Due',      type: 'date' },
    ],

    serviceTypes: [
      'Haircut',
      'Hair Color',
      'Hair Highlights',
      'Hair Spa',
      'Keratin and Smoothening',
      'Facial',
      'Cleanup',
      'Waxing',
      'Threading',
      'Massage',
      'Nail Services — Manicure',
      'Nail Services — Pedicure',
      'Eyebrow Shaping',
      'Bridal Package',
      'Other',
    ],

    serviceFields: [
      { key: 'stylistName',    label: 'Stylist Name',         type: 'text', placeholder: 'e.g. Meera' },
      { key: 'productsUsed',   label: 'Products Used',        type: 'text', placeholder: 'e.g. Loreal keratin, OPI nail polish' },
      { key: 'colorShade',     label: 'Color Shade (if applicable)', type: 'text', placeholder: 'e.g. Ash blonde 7.1' },
    ],

    automationTriggers: [
      'Next haircut due (30 to 45 days)',
      'Hair color touch-up (20 to 30 days)',
      'Facial and cleanup cycle (15 to 30 days)',
      'Birthday offers',
      'Inactive client — no visit in 60 to 90 days',
    ],
  },

  // ── 4. HOME CLEANING AND MANAGEMENT ────────────────────────────
  home_cleaning: {
    label: 'Home Cleaning and Management',
    assetLabel: 'Property Details',
    assetName: 'Property',

    assetFields: [
      { key: 'entityName',       label: 'Property Name / Identifier',   type: 'text',   placeholder: 'e.g. Home, Office, Villa' },
      { key: 'propertyAddress',  label: 'Property Address',             type: 'text',   placeholder: 'Full address or area' },
      { key: 'propertyType',     label: 'Property Type',                type: 'select', options: ['Apartment', 'Independent House', 'Villa', 'Office', 'Commercial Space', 'Other'] },
      { key: 'propertySize',     label: 'Size',                         type: 'select', options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Studio', 'Villa', 'Office (Small)', 'Office (Large)', 'Custom'] },
      { key: 'squareFeet',       label: 'Area (Sq ft)',                 type: 'text',   placeholder: 'e.g. 1200' },
      { key: 'numberOfRooms',    label: 'Number of Rooms',              type: 'text',   placeholder: 'e.g. 3' },
      { key: 'specialAreas',     label: 'Special Areas to Note',        type: 'text',   placeholder: 'e.g. Large balcony, modular kitchen, swimming pool' },
      { key: 'preferredTime',    label: 'Preferred Service Time',       type: 'select', options: ['Morning (7am-11am)', 'Afternoon (11am-3pm)', 'Evening (3pm-7pm)', 'Flexible'] },
      { key: 'specialInstructions', label: 'Special Instructions',      type: 'text',   placeholder: 'e.g. Dog at home, no chemicals in kitchen' },
    ],

    retentionFields: [
      { key: 'nextDeepCleanDate',   label: 'Next Deep Clean Due',          type: 'date' },
      { key: 'cleaningSchedule',    label: 'Recurring Schedule',           type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly', 'One-time', 'On-demand'] },
      { key: 'nextPestControlDate', label: 'Next Pest Control Due',        type: 'date' },
      { key: 'nextMaintenanceDate', label: 'Next Maintenance Check Due',   type: 'date' },
    ],

    serviceTypes: [
      'Deep Cleaning',
      'Regular Cleaning',
      'Kitchen Cleaning',
      'Bathroom Cleaning',
      'Sofa and Upholstery Cleaning',
      'Carpet Cleaning',
      'Balcony Cleaning',
      'Post-construction Cleaning',
      'Pest Control',
      'Plumbing Check',
      'Electrical Check',
      'General Maintenance',
      'Other',
    ],

    serviceFields: [
      { key: 'assignedStaff', label: 'Assigned Staff',          type: 'text', placeholder: 'e.g. Ravi, Team B' },
      { key: 'duration',      label: 'Duration',                type: 'select', options: ['1 hour', '2 hours', '3 hours', '4 hours', 'Half day', 'Full day'] },
      { key: 'areasServiced', label: 'Areas Serviced',          type: 'text', placeholder: 'e.g. Kitchen, 2 bathrooms, living room' },
    ],

    automationTriggers: [
      'Monthly deep clean reminder',
      'Weekly recurring schedule',
      'Pest control every 3 to 6 months',
      'Seasonal cleaning — Diwali, New Year',
      'Inactive customer — no booking in 45 days',
    ],
  },

  // ── 5. AC MAINTENANCE ───────────────────────────────────────────
  ac_maintenance: {
    label: 'AC Maintenance and Service',
    assetLabel: 'AC Unit Details',
    assetName: 'AC Unit',

    assetFields: [
      { key: 'entityName',        label: 'AC Unit Identifier',            type: 'text',   placeholder: 'e.g. Bedroom AC, Living Room Unit 1' },
      { key: 'acType',            label: 'AC Type',                       type: 'select', options: ['Split', 'Window', 'Cassette', 'Central', 'Tower', 'Portable'] },
      { key: 'brand',             label: 'Brand',                         type: 'select', options: ['LG', 'Daikin', 'Voltas', 'Blue Star', 'Carrier', 'Hitachi', 'Samsung', 'Panasonic', 'Godrej', 'O General', 'Other'] },
      { key: 'model',             label: 'Model Number',                  type: 'text',   placeholder: 'e.g. KS-Q18YNZA' },
      { key: 'capacity',          label: 'Capacity',                      type: 'select', options: ['0.75 Ton', '1 Ton', '1.2 Ton', '1.5 Ton', '2 Ton', '2.5 Ton', '3 Ton', 'Other'] },
      { key: 'installationDate',  label: 'Installation Date',             type: 'date' },
      { key: 'warrantyStatus',    label: 'Warranty Status',               type: 'select', options: ['Under Warranty', 'Out of Warranty', 'AMC Active', 'Unknown'] },
      { key: 'locationInProperty',label: 'Location in Property',          type: 'text',   placeholder: 'e.g. Master bedroom, Living room' },
      { key: 'numberOfUnits',     label: 'Number of Units at Property',   type: 'select', options: ['1', '2', '3', '4', '5', '6+'] },
    ],

    retentionFields: [
      { key: 'nextServiceDate',  label: 'Next Service Due Date',          type: 'date' },
      { key: 'serviceFrequency', label: 'Service Frequency',              type: 'select', options: ['Every 3 months', 'Every 6 months', 'Annual', 'As needed'] },
      { key: 'amcStartDate',     label: 'AMC Start Date',                 type: 'date' },
      { key: 'amcExpiryDate',    label: 'AMC Expiry Date',                type: 'date' },
      { key: 'warrantyExpiry',   label: 'Warranty Expiry Date',           type: 'date' },
    ],

    serviceTypes: [
      'General Service',
      'Deep Cleaning',
      'Gas Refill',
      'Repair — Compressor',
      'Repair — PCB',
      'Repair — Fan Motor',
      'Repair — Remote',
      'Installation',
      'Uninstallation',
      'AMC Service Visit',
      'Inspection',
      'Other',
    ],

    serviceFields: [
      { key: 'technicianName',   label: 'Technician Name',               type: 'text', placeholder: 'e.g. Raju' },
      { key: 'gasPressure',      label: 'Gas Pressure Status',           type: 'select', options: ['OK', 'Low — Refilled', 'Not Checked'] },
      { key: 'issuesFound',      label: 'Issues Found',                  type: 'text', placeholder: 'e.g. Clogged filter, low gas, fan noise' },
      { key: 'partsReplaced',    label: 'Parts Replaced',                type: 'text', placeholder: 'e.g. Gas, capacitor, filter' },
    ],

    automationTriggers: [
      'Summer prep reminder (March to April)',
      'Service every 3 to 6 months',
      'AMC renewal before expiry',
      'Warranty expiry alert',
      'Inactive — no service in 12 months',
    ],
  },

  // ── 6. PEST CONTROL ─────────────────────────────────────────────
  pest_control: {
    label: 'Pest Control Services',
    assetLabel: 'Property Details',
    assetName: 'Property',

    assetFields: [
      { key: 'entityName',      label: 'Property Name / ID',             type: 'text',   placeholder: 'e.g. Home, Office, Restaurant' },
      { key: 'propertyAddress', label: 'Property Address',               type: 'text',   placeholder: 'Full address or area' },
      { key: 'propertyType',    label: 'Property Type',                  type: 'select', options: ['Residential — Apartment', 'Residential — Independent House', 'Residential — Villa', 'Commercial — Office', 'Commercial — Restaurant', 'Commercial — Warehouse', 'Industrial', 'Other'] },
      { key: 'propertySize',    label: 'Property Size',                  type: 'select', options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Small Office', 'Large Office', 'Custom'] },
      { key: 'squareFeet',      label: 'Area (Sq ft)',                   type: 'text',   placeholder: 'e.g. 1500' },
      { key: 'problemAreas',    label: 'Problem Areas',                  type: 'text',   placeholder: 'e.g. Kitchen, garden, bathroom, basement' },
      { key: 'pestHistory',     label: 'Pest History / Infestation Type',type: 'text',   placeholder: 'e.g. Termites found in 2023' },
    ],

    retentionFields: [
      { key: 'nextTreatmentDate',    label: 'Next Treatment Due Date',    type: 'date' },
      { key: 'treatmentCycle',       label: 'Treatment Cycle',            type: 'select', options: ['Monthly', 'Every 3 months', 'Every 6 months', 'Annual', 'One-time'] },
      { key: 'warrantyExpiry',       label: 'Treatment Warranty Expiry',  type: 'date' },
      { key: 'followUpInspection',   label: 'Follow-up Inspection Date',  type: 'date' },
    ],

    serviceTypes: [
      'General Pest Control',
      'Termite Treatment',
      'Cockroach Treatment',
      'Rodent Control',
      'Bed Bug Treatment',
      'Mosquito Control',
      'Ant Treatment',
      'Lizard Control',
      'Wood Borer Treatment',
      'Fumigation',
      'Pre-construction Treatment',
      'AMC Visit',
      'Follow-up Inspection',
      'Other',
    ],

    serviceFields: [
      { key: 'technicianName',  label: 'Technician Name',                type: 'text', placeholder: 'e.g. Suresh' },
      { key: 'chemicalsUsed',   label: 'Chemicals / Treatment Used',     type: 'text', placeholder: 'e.g. Bifenthrin, gel bait, heat treatment' },
      { key: 'severityLevel',   label: 'Infestation Severity',           type: 'select', options: ['Low', 'Medium', 'High', 'Severe'] },
      { key: 'treatmentNotes',  label: 'Treatment Notes',                type: 'text', placeholder: 'e.g. Gel applied under sink, spray in garden' },
    ],

    automationTriggers: [
      'Quarterly pest control reminder',
      'Monsoon season reminder (June to July)',
      'Warranty follow-up inspection',
      'AMC renewal reminder',
      'Inactive — no service in 6 months',
    ],
  },

  // ── 7. HEALTHCARE — EYE CLINIC ──────────────────────────────────
  healthcare_eye: {
    label: 'Eye Clinic',
    assetLabel: 'Patient Eye Profile',
    assetName: 'Patient',

    assetFields: [
      { key: 'entityName',        label: 'Patient ID (optional)',         type: 'text',   placeholder: 'e.g. PAT-001 or leave blank' },
      { key: 'dob',               label: 'Date of Birth',                 type: 'date' },
      { key: 'gender',            label: 'Gender',                        type: 'select', options: ['Male', 'Female', 'Prefer not to say'] },
      { key: 'bloodGroup',        label: 'Blood Group',                   type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
      { key: 'existingConditions',label: 'Existing Eye Conditions',       type: 'text',   placeholder: 'e.g. Dry eye, glaucoma, diabetic retinopathy' },
      { key: 'allergies',         label: 'Allergies',                     type: 'text',   placeholder: 'e.g. None, penicillin' },
      { key: 'medications',       label: 'Ongoing Medications',           type: 'text',   placeholder: 'e.g. Eye drops, diabetes medication' },
      { key: 'visionPowerLeft',   label: 'Vision Power — Left Eye',       type: 'text',   placeholder: 'e.g. -2.50' },
      { key: 'visionPowerRight',  label: 'Vision Power — Right Eye',      type: 'text',   placeholder: 'e.g. -1.75' },
      { key: 'glassesOrLens',     label: 'Glasses / Contact Lens',        type: 'select', options: ['Glasses', 'Contact Lens', 'Both', 'None'] },
      { key: 'lastEyeTestDate',   label: 'Last Eye Test Date',            type: 'date' },
    ],

    retentionFields: [
      { key: 'nextCheckupDate',       label: 'Next Eye Checkup Due',          type: 'date' },
      { key: 'nextPrescriptionRenewal', label: 'Prescription Renewal Due',    type: 'date' },
      { key: 'surgeryFollowUpDate',   label: 'Surgery Follow-up Date',        type: 'date' },
    ],

    serviceTypes: [
      'Eye Checkup',
      'Vision Test',
      'Prescription Update',
      'Contact Lens Fitting',
      'LASIK Consultation',
      'LASIK Surgery',
      'Cataract Surgery',
      'Glaucoma Treatment',
      'Diabetic Eye Exam',
      'Retinal Exam',
      'Post-surgery Follow-up',
      'Other',
    ],

    serviceFields: [
      { key: 'doctorName',          label: 'Doctor Name',                  type: 'text', placeholder: 'e.g. Dr. Anita Reddy' },
      { key: 'prescriptionUpdated', label: 'Prescription Updated',         type: 'select', options: ['Yes', 'No', 'Not applicable'] },
      { key: 'newVisionPowerLeft',  label: 'Updated Vision Power — Left',  type: 'text', placeholder: 'e.g. -2.75' },
      { key: 'newVisionPowerRight', label: 'Updated Vision Power — Right', type: 'text', placeholder: 'e.g. -2.00' },
    ],

    automationTriggers: [
      'Annual eye checkup reminder',
      'Prescription renewal (every 12 months)',
      'Post-surgery follow-up',
      'Inactive patient — no visit in 12 months',
    ],
  },

  // ── 8. HEALTHCARE — DENTAL CLINIC ───────────────────────────────
  healthcare_dental: {
    label: 'Dental Clinic',
    assetLabel: 'Patient Dental Profile',
    assetName: 'Patient',

    assetFields: [
      { key: 'entityName',        label: 'Patient ID (optional)',          type: 'text',   placeholder: 'e.g. PAT-001 or leave blank' },
      { key: 'dob',               label: 'Date of Birth',                  type: 'date' },
      { key: 'gender',            label: 'Gender',                         type: 'select', options: ['Male', 'Female', 'Prefer not to say'] },
      { key: 'bloodGroup',        label: 'Blood Group',                    type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] },
      { key: 'existingConditions',label: 'Existing Health Conditions',     type: 'text',   placeholder: 'e.g. Diabetes, hypertension' },
      { key: 'allergies',         label: 'Allergies',                      type: 'text',   placeholder: 'e.g. None, penicillin' },
      { key: 'medications',       label: 'Ongoing Medications',            type: 'text',   placeholder: 'e.g. Blood thinners' },
      { key: 'lastCleaningDate',  label: 'Last Dental Cleaning Date',      type: 'date' },
      { key: 'dentalIssues',      label: 'Existing Dental Issues',         type: 'text',   placeholder: 'e.g. Cavity upper left molar, gum sensitivity' },
      { key: 'ongoingTreatments', label: 'Ongoing Treatments',             type: 'text',   placeholder: 'e.g. Braces (started Jan 2024), RCT in progress' },
    ],

    retentionFields: [
      { key: 'nextCleaningDate',    label: 'Next Cleaning Due',             type: 'date' },
      { key: 'nextCheckupDate',     label: 'Next Checkup Due',              type: 'date' },
      { key: 'treatmentFollowUp',   label: 'Treatment Follow-up Date',      type: 'date' },
    ],

    serviceTypes: [
      'Dental Cleaning',
      'Routine Checkup',
      'Filling',
      'Root Canal Treatment',
      'Extraction',
      'Braces — Fitting',
      'Braces — Adjustment',
      'Crown and Bridge',
      'Teeth Whitening',
      'Implant Consultation',
      'Implant Procedure',
      'Gum Treatment',
      'X-Ray',
      'Post-treatment Follow-up',
      'Other',
    ],

    serviceFields: [
      { key: 'doctorName',        label: 'Doctor Name',                    type: 'text', placeholder: 'e.g. Dr. Kiran Mehta' },
      { key: 'toothNumber',       label: 'Tooth Number / Area Treated',    type: 'text', placeholder: 'e.g. Upper left molar, #16' },
      { key: 'xrayTaken',         label: 'X-Ray Taken',                    type: 'select', options: ['Yes', 'No'] },
      { key: 'prescriptionGiven', label: 'Prescription Given',             type: 'select', options: ['Yes', 'No'] },
    ],

    automationTriggers: [
      '6-month dental cleaning reminder',
      'Treatment follow-up (custom date)',
      'Braces adjustment reminder',
      'Annual checkup reminder',
      'Inactive patient — no visit in 12 months',
    ],
  },

  // ── 9. FITNESS AND WELLNESS ─────────────────────────────────────
  fitness_wellness: {
    label: 'Fitness and Wellness',
    assetLabel: 'Membership Profile',
    assetName: 'Membership',

    assetFields: [
      { key: 'entityName',      label: 'Membership ID',                   type: 'text',   placeholder: 'e.g. MEM-001 or leave blank' },
      { key: 'dob',             label: 'Date of Birth',                   type: 'date' },
      { key: 'gender',          label: 'Gender',                          type: 'select', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
      { key: 'fitnessGoal',     label: 'Fitness Goal',                    type: 'select', options: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Flexibility', 'Sports Performance', 'Rehabilitation', 'Other'] },
      { key: 'membershipPlan',  label: 'Membership Plan',                 type: 'select', options: ['Monthly', 'Quarterly', '6 Months', 'Annual', 'Pay per Session', 'Custom'] },
      { key: 'membershipStart', label: 'Membership Start Date',           type: 'date' },
      { key: 'membershipEnd',   label: 'Membership End Date',             type: 'date' },
      { key: 'trainerAssigned', label: 'Trainer Assigned',                type: 'text',   placeholder: 'e.g. Vikram Sir' },
      { key: 'healthConditions',label: 'Health Conditions / Limitations', type: 'text',   placeholder: 'e.g. Lower back pain, knee injury' },
    ],

    retentionFields: [
      { key: 'membershipExpiry',  label: 'Membership Expiry Date',         type: 'date' },
      { key: 'renewalReminderDate', label: 'Send Renewal Reminder On',     type: 'date' },
      { key: 'lastVisitDate',     label: 'Last Visit Date',                type: 'date' },
      { key: 'inactiveDays',      label: 'Alert if Inactive for (days)',   type: 'select', options: ['7 days', '10 days', '14 days', '21 days', '30 days'] },
    ],

    serviceTypes: [
      'Gym Session',
      'Personal Training Session',
      'Yoga Class',
      'Zumba Class',
      'Pilates Session',
      'CrossFit Session',
      'Spinning Class',
      'Group Class',
      'Body Composition Assessment',
      'Nutrition Consultation',
      'Physiotherapy Session',
      'Membership Renewal',
      'Trial Session',
      'Other',
    ],

    serviceFields: [
      { key: 'trainerName',    label: 'Trainer Name',                     type: 'text', placeholder: 'e.g. Vikram' },
      { key: 'sessionType',    label: 'Session Type',                     type: 'text', placeholder: 'e.g. Strength, Cardio, HIIT' },
      { key: 'attendance',     label: 'Attendance',                       type: 'select', options: ['Present', 'Late', 'Absent', 'Not applicable'] },
    ],

    automationTriggers: [
      'Membership expiry reminder (7 days before)',
      'Inactivity alert (no visit in 7 to 14 days)',
      'Goal check-in reminder (monthly)',
      'Renewal nudge after expiry',
      'Birthday offer',
    ],
  },

  // ── 10. REAL ESTATE ─────────────────────────────────────────────
  real_estate: {
    label: 'Real Estate',
    assetLabel: 'Buyer / Lead Profile',
    assetName: 'Lead',

    assetFields: [
      { key: 'entityName',        label: 'Lead / Requirement ID',         type: 'text',   placeholder: 'e.g. LEAD-001 or leave blank' },
      { key: 'requirementType',   label: 'Looking to',                    type: 'select', options: ['Buy', 'Rent', 'Invest', 'Sell', 'Commercial — Buy', 'Commercial — Rent'] },
      { key: 'budgetMin',         label: 'Budget — Minimum (Rs.)',        type: 'text',   placeholder: 'e.g. 5000000' },
      { key: 'budgetMax',         label: 'Budget — Maximum (Rs.)',        type: 'text',   placeholder: 'e.g. 8000000' },
      { key: 'preferredLocation', label: 'Preferred Location / Area',     type: 'text',   placeholder: 'e.g. Koramangala, HSR Layout, Whitefield' },
      { key: 'propertyType',      label: 'Property Type Preferred',       type: 'select', options: ['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Villa', 'Plot', 'Commercial Office', 'Commercial Retail', 'Any'] },
      { key: 'timeline',          label: 'Timeline to Purchase / Move',   type: 'select', options: ['Immediately', 'Within 1 month', 'Within 3 months', 'Within 6 months', 'Within 1 year', 'Just exploring'] },
      { key: 'source',            label: 'Lead Source',                   type: 'select', options: ['Walk-in', 'Referral', 'Online Ad', 'Portal (99acres, MagicBricks)', 'Social Media', 'Cold Call', 'Other'] },
      { key: 'agentAssigned',     label: 'Agent Assigned',                type: 'text',   placeholder: 'e.g. Neha Sharma' },
      { key: 'notes',             label: 'Additional Notes',              type: 'text',   placeholder: 'e.g. Needs parking, prefers east-facing' },
    ],

    retentionFields: [
      { key: 'nextFollowUpDate',  label: 'Next Follow-up Date',           type: 'date' },
      { key: 'leadStatus',        label: 'Lead Status',                   type: 'select', options: ['New', 'Active', 'Site Visit Scheduled', 'Negotiating', 'Deal Closed', 'Lost', 'On Hold'] },
      { key: 'siteVisitDate',     label: 'Site Visit Date',               type: 'date' },
    ],

    serviceTypes: [
      'Initial Consultation',
      'Site Visit',
      'Property Shortlisting',
      'Follow-up Call',
      'Offer Presentation',
      'Negotiation Meeting',
      'Documentation',
      'Registration',
      'Post-sale Follow-up',
      'Rental Renewal',
      'Other',
    ],

    serviceFields: [
      { key: 'agentName',         label: 'Agent Name',                    type: 'text', placeholder: 'e.g. Neha Sharma' },
      { key: 'propertyShown',     label: 'Property Shown / Discussed',    type: 'text', placeholder: 'e.g. 2BHK in Koramangala, Project XYZ' },
      { key: 'clientFeedback',    label: 'Client Feedback',               type: 'text', placeholder: 'e.g. Liked it, concerned about price' },
      { key: 'leadStatusUpdate',  label: 'Update Lead Status To',         type: 'select', options: ['Active', 'Site Visit Scheduled', 'Negotiating', 'Deal Closed', 'Lost', 'On Hold'] },
    ],

    automationTriggers: [
      'Follow-up reminder (custom date)',
      'No response in 3 days — nudge',
      'No response in 7 days — re-engage',
      'Rental renewal reminder (annual)',
      'Inactive lead — no contact in 30 days',
    ],
  },
};

// ─── Helper functions ─────────────────────────────────────────────

/**
 * Get full config for a vertical key.
 * Falls back to a safe generic config if vertical is unknown.
 */
export function getConfig(vertical) {
  return INDUSTRY_CONFIG[vertical] || getGenericConfig();
}

/**
 * Generic fallback config used when vertical is not set or unrecognized.
 */
export function getGenericConfig() {
  return {
    label: 'Service Business',
    assetLabel: 'Item / Entity Details',
    assetName: 'Entity',
    assetFields: [
      { key: 'entityName',    label: 'Name / Label',        type: 'text',   placeholder: 'e.g. Name or identifier' },
      { key: 'entityType',    label: 'Type',                type: 'select', options: ['Animal / Pet', 'Vehicle', 'Equipment', 'Property', 'Product', 'Person', 'Other'] },
      { key: 'description',   label: 'Description / Model', type: 'text',   placeholder: 'e.g. Breed, model, or variant' },
      { key: 'dobOrYear',     label: 'Age / Year / DOB',    type: 'text',   placeholder: 'e.g. 3 years, 2019' },
      { key: 'registrationNo',label: 'ID / Registration',   type: 'text',   placeholder: 'Optional' },
    ],
    retentionFields: [
      { key: 'nextServiceDate', label: 'Next Service Due Date', type: 'date' },
    ],
    serviceTypes: [
      'Consultation / Checkup',
      'Maintenance / Service',
      'Repair / Treatment',
      'Installation / Setup',
      'Inspection / Assessment',
      'Cleaning / Grooming',
      'Renewal / Subscription',
      'Follow-up Visit',
      'Emergency Service',
      'Other',
    ],
    serviceFields: [],
    automationTriggers: [
      'Next service due date reminder',
      'Inactive customer — no visit in 90 days',
    ],
  };
}

/**
 * Returns just the service types array for a given vertical.
 * Used by the Log Service modal.
 */
export function getServiceTypes(vertical) {
  return getConfig(vertical).serviceTypes;
}

/**
 * Returns the display label for a vertical key.
 */
export function getVerticalLabel(vertical) {
  const found = VERTICALS.find(v => v.value === vertical);
  return found ? found.label : 'Service Business';
}