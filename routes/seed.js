const express = require('express');
const router = express.Router();

// Import models from the models directory
const {
  Country,
  City,
  Area,
  Hospital,
  HospitalPhone,
  HospitalFacility,
  Doctor,
  DoctorCertification,
  DoctorHospital,
} = require('../models');

// Function to insert sample data into the database
async function seedDatabase() {
  try {
    // 1. Insert one country: Iraq
    const countriesData = [
      { name: 'Iraq' }
    ];
    const countries = await Country.bulkCreate(countriesData);

    // 2. Insert 5 cities: Sulaimani, Hawler, Dhok, Karkuk, Halabja
    const citiesData = [
      { name: 'Sulaimani', country_id: countries[0].country_id },
      { name: 'Hawler', country_id: countries[0].country_id },
      { name: 'Dhok', country_id: countries[0].country_id },
      { name: 'Karkuk', country_id: countries[0].country_id },
      { name: 'Halabja', country_id: countries[0].country_id }
    ];
    const cities = await City.bulkCreate(citiesData);

    // 3. Insert Areas: each city gets 3 areas (one named "Central")
    const areasData = [
      { name: 'Central', city_id: cities[0].city_id },
      { name: 'Piramagrun', city_id: cities[0].city_id },
      { name: 'Arbat', city_id: cities[0].city_id },
      { name: 'Central', city_id: cities[1].city_id },
      { name: 'Area Hawler 1', city_id: cities[1].city_id },
      { name: 'Area Hawler 2', city_id: cities[1].city_id },
      { name: 'Central', city_id: cities[2].city_id },
      { name: 'Area Dhok 1', city_id: cities[2].city_id },
      { name: 'Area Dhok 2', city_id: cities[2].city_id },
      { name: 'Central', city_id: cities[3].city_id },
      { name: 'Area Karkuk 1', city_id: cities[3].city_id },
      { name: 'Area Karkuk 2', city_id: cities[3].city_id },
      { name: 'Central', city_id: cities[4].city_id },
      { name: 'Area Halabja 1', city_id: cities[4].city_id },
      { name: 'Area Halabja 2', city_id: cities[4].city_id }
    ];
    const areas = await Area.bulkCreate(areasData);

    // 4. Insert Hospitals: each city gets 2 hospitals
    const hospitalsData = [
      { area_id: areas[0].area_id, name: 'Shar', summary: 'Leading hospital in Sulaimani Central.', emergency_status: true, address: 'Shar Hospital, Malik Mahmud Ring Road, Sulaymaniyah, KRG, 46001', contact_email: 'contact@sulaimaniA.com', website: 'http://sulaimaniA.com', is_private: false, image_url: 'https://i.pinimg.com/474x/32/26/fa/3226fae8c2fd31e1c49f441c36ed100c.jpg', status:"active" },
      { area_id: areas[1].area_id, name: 'Bakhshin', summary: 'Quality care in Sulaimani.', emergency_status: true, address: 'Baxshin Hospital، Iraq/As sulaimanya Malik Mahmood Ring Road، 46001', contact_email: 'contact@sulaimaniB.com', website: 'http://sulaimaniB.com', is_private: false, image_url: 'https://i.pinimg.com/474x/c9/96/2f/c9962fdc232fd936824711168e3e0e51.jpg', status:"active" },
      { area_id: areas[2].area_id, name: 'Faruq', summary: 'Top hospital in Hawler Central.', emergency_status: true, address: 'Faruk Medical City، 24 30 suleimany, Sulaymaniyah, 46001', contact_email: 'contact@hawlerA.com', website: 'http://hawlerA.com', is_private: false, image_url: 'https://i.pinimg.com/474x/23/a3/fc/23a3fcb132125c3020ff93dbff2626ed.jpg', status:"active" },
      { area_id: areas[3].area_id, name: 'Hospital Dhok A', summary: 'Leading hospital in Dhok Central.', emergency_status: false, address: 'Street 1, Dhok', contact_email: 'contact@dhokA.com', website: 'http://dhokA.com', is_private: false, image_url: 'https://i.pinimg.com/474x/48/96/6a/48966a606e239ea04f91ee86d5c7d480.jpg', status:"active" },
      { area_id: areas[4].area_id, name: 'Hospital Dhok B', summary: 'Quality care in Dhok.', emergency_status: true, address: 'Street 2, Dhok', contact_email: 'contact@dhokB.com', website: 'http://dhokB.com', is_private: false, image_url: 'https://i.pinimg.com/474x/bc/c0/13/bcc013aa69420dc0f628c713a8e27e78.jpg', status:"active" },
      { area_id: areas[5].area_id, name: 'Hospital Karkuk A', summary: 'Top hospital in Karkuk Central.', emergency_status: true, address: 'Street 1, Karkuk', contact_email: 'contact@karkukA.com', website: 'http://karkukA.com', is_private: false, image_url: 'https://i.pinimg.com/474x/25/ca/d0/25cad068376984dd3329f03405196bf0.jpg', status:"active" },
      { area_id: areas[6].area_id, name: 'Hospital Karkuk B', summary: 'Quality care in Karkuk.', emergency_status: true, address: 'Street 2, Karkuk', contact_email: 'contact@karkukB.com', website: 'http://karkukB.com', is_private: false, image_url: 'https://i.pinimg.com/474x/33/0a/08/330a08acb77fefab7817660d35c246c5.jpg', status:"active" },
      { area_id: areas[7].area_id, name: 'Hospital Halabja A', summary: 'Leading hospital in Halabja Central.', emergency_status: false, address: 'Street 1, Halabja', contact_email: 'contact@halabjaA.com', website: 'http://halabjaA.com', is_private: false, image_url: 'https://i.pinimg.com/474x/79/ec/5a/79ec5aca95fb7d4c90aba31e2290d2c7.jpg', status:"active" },
      { area_id: areas[8].area_id, name: 'Hospital Halabja B', summary: 'Quality service in Halabja.', emergency_status: true, address: 'Street 2, Halabja', contact_email: 'contact@halabjaB.com', website: 'http://halabjaB.com', is_private: false, image_url: 'https://i.pinimg.com/474x/d2/e8/a3/d2e8a392f88fa4e7feba3efa251108ed.jpg', status:"active" },
    ];
 
    const hospitals = await Hospital.bulkCreate(hospitalsData);
    console.log("222");
    // console.log(hospitals[9].hospital_id);
    
    // 5. Insert Hospital Phones
    const hospitalPhonesData = [
      { hospital_id: hospitals[0].hospital_id, phone_number: '0771-100001' },
      { hospital_id: hospitals[1].hospital_id, phone_number: '0771-100002' },
      { hospital_id: hospitals[2].hospital_id, phone_number: '0771-100003' },
      { hospital_id: hospitals[3].hospital_id, phone_number: '0771-100004' },
      { hospital_id: hospitals[4].hospital_id, phone_number: '0771-100005' },
      { hospital_id: hospitals[5].hospital_id, phone_number: '0771-100006' },
      { hospital_id: hospitals[6].hospital_id, phone_number: '0771-100007' },
      { hospital_id: hospitals[7].hospital_id, phone_number: '0771-100008' },
    ];
       console.log("watche here");
       console.log(hospitalPhonesData);
    await HospitalPhone.bulkCreate(hospitalPhonesData);

    // 6. Insert Hospital Facilities
    const hospitalFacilitiesData = [
      { hospital_id: hospitals[0].hospital_id, facility_name: 'X-Ray' },
      { hospital_id: hospitals[1].hospital_id, facility_name: 'MRI' },
      { hospital_id: hospitals[2].hospital_id, facility_name: 'CT Scan' },
      { hospital_id: hospitals[3].hospital_id, facility_name: 'Pharmacy' },
      { hospital_id: hospitals[4].hospital_id, facility_name: 'Ambulance' },
      { hospital_id: hospitals[5].hospital_id, facility_name: 'ICU' },
      { hospital_id: hospitals[1].hospital_id, facility_name: 'Cardiology' },
      { hospital_id: hospitals[2].hospital_id, facility_name: 'Neurology' },
      { hospital_id: hospitals[3].hospital_id, facility_name: 'Pediatrics' },
      { hospital_id: hospitals[4].hospital_id, facility_name: 'Emergency Room' },
    ];
    await HospitalFacility.bulkCreate(hospitalFacilitiesData);

    // 7. Insert Doctors
    const doctorsData = [
      { first_name: 'Hemin', last_name: 'Abdullah', title: 'MD', bio: 'Expert in general medicine', image_url: 'https://i.pinimg.com/736x/6c/6e/d7/6c6ed7f4011b7f926b3f1505475aba16.jpg' },
      { first_name: 'Berivan', last_name: 'Jalal', title: 'Surgeon', bio: 'Specialist in surgery', image_url: 'https://i.pinimg.com/736x/41/27/76/4127760eda016c4eb150e1a7225bc7a8.jpg' },
      { first_name: 'Zana', last_name: 'Karim', title: 'Pediatrician', bio: 'Focused on child health', image_url: 'https://i.pinimg.com/474x/a9/56/b1/a956b102778d9078e5b2c1201c5c90ec.jpg' },
      { first_name: 'Rojin', last_name: 'Hassan', title: 'Orthopedic', bio: 'Expert in bone and joint surgery', image_url: 'https://i.pinimg.com/474x/0d/d0/97/0dd09727d2c91e9b0072f59317854f50.jpg' },
      { first_name: 'Shivan', last_name: 'Azad', title: 'Dermatologist', bio: 'Skilled in skin treatments', image_url: 'https://i.pinimg.com/474x/8b/e0/f2/8be0f209bc6f23aacffb27aa3c2b2e2d.jpg' },
      { first_name: 'Avin', last_name: 'Soran', title: 'Neurologist', bio: 'Specialist in brain health', image_url: 'https://i.pinimg.com/474x/40/72/0f/40720fef1c1b0a96df2f0132c6ded59c.jpg' },
      { first_name: 'Nazar', last_name: 'Qadir', title: 'Gynecologist', bio: 'Experienced in women’s health', image_url: 'https://i.pinimg.com/736x/ad/6c/b0/ad6cb07e44a5e63ffc89d7723b181052.jpg' },
      { first_name: 'Hor', last_name: 'Jon', title: 'General Practitioner', bio: 'Family medicine expert', image_url: 'https://i.pinimg.com/736x/8e/c3/ed/8ec3edc3236fc4a558385c128fb2d4cb.jpg' },
      { first_name: 'Choman', last_name: 'Aso', title: 'Cardiologist', bio: 'Expert in heart conditions', image_url: 'https://i.pinimg.com/474x/6d/b4/4f/6db44f206bb332cd749c5e92ed9bfa91.jpg' },
      { first_name: 'Aram', last_name: 'Barzani', title: 'Radiologist', bio: 'Skilled in diagnostic imaging', image_url: 'https://i.pinimg.com/474x/0d/1e/82/0d1e8268dd98805f486459b18b7868ee.jpg' }
    ];
    const doctors = await Doctor.bulkCreate(doctorsData);

    // 8. Insert Doctor Certifications
    const doctorCertificationsData = [
      { doctor_id: doctors[0].doctor_id, title: 'General Medicine Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2010-01-15' },
      { doctor_id: doctors[1].doctor_id, title: 'Surgery Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2011-03-20' },
      { doctor_id: doctors[2].doctor_id, title: 'Pediatrics Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2012-05-10' },
      { doctor_id: doctors[3].doctor_id, title: 'Orthopedic Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2009-07-22' },
      { doctor_id: doctors[4].doctor_id, title: 'Dermatology Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2013-09-05' },
      { doctor_id: doctors[5].doctor_id, title: 'Neurology Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2010-11-12' },
      { doctor_id: doctors[6].doctor_id, title: 'Gynecology Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2014-02-28' },
      { doctor_id: doctors[7].doctor_id, title: 'General Practice Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2008-04-16' },
      { doctor_id: doctors[8].doctor_id, title: 'Cardiology Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2011-06-30' },
      { doctor_id: doctors[9].doctor_id, title: 'Radiology Certification', degree_level: 'Level 1', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2010-08-21' }
    ];
    await DoctorCertification.bulkCreate(doctorCertificationsData);

    // 9. Insert Doctor Hospitals (join table)
    const doctorHospitalsData = [
      { doctor_id: doctors[0].doctor_id, hospital_id: hospitals[0].hospital_id },
      { doctor_id: doctors[1].doctor_id, hospital_id: hospitals[1].hospital_id },
      { doctor_id: doctors[2].doctor_id, hospital_id: hospitals[2].hospital_id },
      { doctor_id: doctors[3].doctor_id, hospital_id: hospitals[3].hospital_id },
      { doctor_id: doctors[4].doctor_id, hospital_id: hospitals[4].hospital_id },
      { doctor_id: doctors[5].doctor_id, hospital_id: hospitals[5].hospital_id },
      { doctor_id: doctors[6].doctor_id, hospital_id: hospitals[6].hospital_id },
      { doctor_id: doctors[7].doctor_id, hospital_id: hospitals[7].hospital_id },
      { doctor_id: doctors[2].doctor_id, hospital_id: hospitals[4].hospital_id },
      { doctor_id: doctors[1].doctor_id, hospital_id: hospitals[5].hospital_id }
    ];
    await DoctorHospital.bulkCreate(doctorHospitalsData);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// --- Express route to trigger database seeding ---
router.get('/', async (req, res) => {
  try {
    console.log("Starting seed route handler");
    
    // Check if the Country table already has records
    const count = await Country.count();
    console.log("Current country count:", count);
    
    if (count > 0) {
      console.log("Database already seeded, skipping");
      return res.render('index', { title: 'Home', user: req.session.user });
    }

    console.log("Database empty, starting seed process");
    await seedDatabase();
    console.log("Seed process completed successfully");
    
    res.render('index', { title: 'Home', user: req.session.user });
  } catch (err) {
    console.log("Error encountered in seed route:");
    console.error("Seeding failed:", err);
    res.status(500).render('index', { title: 'Home', user: req.session.user });
  }
});

module.exports = router;
