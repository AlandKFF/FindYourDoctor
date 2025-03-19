const express = require('express');
const router = express.Router();

// Import models from the models directory
const {
  City,
  Country,
  Doctor,
  DoctorCertification,
  DoctorHospital,
  Facility,
  Hospital,
  HospitalFacility,
  HospitalGallery,
  HospitalPhone,
  Village
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

    // 3. Insert villages: each city gets 3 villages (one named "Central")
    const villagesData = [
      // For Sulaimani
      { name: 'Central', city_id: cities[0].city_id },
      { name: 'Gundî Sulaimani 1', city_id: cities[0].city_id },
      { name: 'Gundî Sulaimani 2', city_id: cities[0].city_id },
      // For Hawler
      { name: 'Central', city_id: cities[1].city_id },
      { name: 'Gundî Hawler 1', city_id: cities[1].city_id },
      { name: 'Gundî Hawler 2', city_id: cities[1].city_id },
      // For Dhok
      { name: 'Central', city_id: cities[2].city_id },
      { name: 'Gundî Dhok 1', city_id: cities[2].city_id },
      { name: 'Gundî Dhok 2', city_id: cities[2].city_id },
      // For Karkuk
      { name: 'Central', city_id: cities[3].city_id },
      { name: 'Gundî Karkuk 1', city_id: cities[3].city_id },
      { name: 'Gundî Karkuk 2', city_id: cities[3].city_id },
      // For Halabja
      { name: 'Central', city_id: cities[4].city_id },
      { name: 'Gundî Halabja 1', city_id: cities[4].city_id },
      { name: 'Gundî Halabja 2', city_id: cities[4].city_id }
    ];
    const villages = await Village.bulkCreate(villagesData);

    // 4. Insert Hospitals: each city has 2 hospitals.
    // We assign one hospital to the "Central" village and one to the first random village.
    const hospitalsData = [
      // Sulaimani (villages[0] = Central, villages[1] = Gundî Sulaimani 1)
      { village_id: villages[0].village_id, name: 'Shar', summary: 'Leading hospital in Sulaimani Central.', emergency_status: true, address: 'Street 1, Sulaimani', contact_email: 'contact@sulaimaniA.com', website: 'http://sulaimaniA.com', parking_availability: true, open_at: '08:00:00', close_at: '20:00:00' },
      { village_id: villages[1].village_id, name: 'Hospital Sulaimani B', summary: 'Quality care in Sulaimani.', emergency_status: true, address: 'Street 2, Sulaimani', contact_email: 'contact@sulaimaniB.com', website: 'http://sulaimaniB.com', parking_availability: true, open_at: '09:00:00', close_at: '21:00:00' },
      // Hawler (villages[3] = Central, villages[4] = Gundî Hawler 1)
      { village_id: villages[3].village_id, name: 'Hospital Hawler A', summary: 'Top hospital in Hawler Central.', emergency_status: true, address: 'Street 1, Hawler', contact_email: 'contact@hawlerA.com', website: 'http://hawlerA.com', parking_availability: true, open_at: '08:00:00', close_at: '20:00:00' },
      { village_id: villages[4].village_id, name: 'Hospital Hawler B', summary: 'Quality service in Hawler.', emergency_status: true, address: 'Street 2, Hawler', contact_email: 'contact@hawlerB.com', website: 'http://hawlerB.com', parking_availability: true, open_at: '09:00:00', close_at: '21:00:00' },
      // Dhok (villages[6] = Central, villages[7] = Gundî Dhok 1)
      { village_id: villages[6].village_id, name: 'Hospital Dhok A', summary: 'Leading hospital in Dhok Central.', emergency_status: false, address: 'Street 1, Dhok', contact_email: 'contact@dhokA.com', website: 'http://dhokA.com', parking_availability: false, open_at: '07:30:00', close_at: '19:30:00' },
      { village_id: villages[7].village_id, name: 'Hospital Dhok B', summary: 'Quality care in Dhok.', emergency_status: true, address: 'Street 2, Dhok', contact_email: 'contact@dhokB.com', website: 'http://dhokB.com', parking_availability: true, open_at: '08:00:00', close_at: '22:00:00' },
      // Karkuk (villages[9] = Central, villages[10] = Gundî Karkuk 1)
      { village_id: villages[9].village_id, name: 'Hospital Karkuk A', summary: 'Top hospital in Karkuk Central.', emergency_status: true, address: 'Street 1, Karkuk', contact_email: 'contact@karkukA.com', website: 'http://karkukA.com', parking_availability: true, open_at: '08:00:00', close_at: '20:00:00' },
      { village_id: villages[10].village_id, name: 'Hospital Karkuk B', summary: 'Quality care in Karkuk.', emergency_status: true, address: 'Street 2, Karkuk', contact_email: 'contact@karkukB.com', website: 'http://karkukB.com', parking_availability: true, open_at: '09:00:00', close_at: '21:00:00' },
      // Halabja (villages[12] = Central, villages[13] = Gundî Halabja 1)
      { village_id: villages[12].village_id, name: 'Hospital Halabja A', summary: 'Leading hospital in Halabja Central.', emergency_status: false, address: 'Street 1, Halabja', contact_email: 'contact@halabjaA.com', website: 'http://halabjaA.com', parking_availability: false, open_at: '07:30:00', close_at: '19:30:00' },
      { village_id: villages[13].village_id, name: 'Hospital Halabja B', summary: 'Quality service in Halabja.', emergency_status: true, address: 'Street 2, Halabja', contact_email: 'contact@halabjaB.com', website: 'http://halabjaB.com', parking_availability: true, open_at: '08:00:00', close_at: '20:00:00' },
    ];
    const hospitals = await Hospital.bulkCreate(hospitalsData);

    // 5. Insert Hospital Phones (one phone per hospital)
    const hospitalPhonesData = [
      { hospital_id: hospitals[0].hospital_id, phone_number: '0771-100001' },
      { hospital_id: hospitals[1].hospital_id, phone_number: '0771-100002' },
      { hospital_id: hospitals[2].hospital_id, phone_number: '0771-100003' },
      { hospital_id: hospitals[3].hospital_id, phone_number: '0771-100004' },
      { hospital_id: hospitals[4].hospital_id, phone_number: '0771-100005' },
      { hospital_id: hospitals[5].hospital_id, phone_number: '0771-100006' },
      { hospital_id: hospitals[6].hospital_id, phone_number: '0771-100007' },
      { hospital_id: hospitals[7].hospital_id, phone_number: '0771-100008' },
      { hospital_id: hospitals[8].hospital_id, phone_number: '0771-100009' },
      { hospital_id: hospitals[9].hospital_id, phone_number: '0771-100010' },
    ];
    await HospitalPhone.bulkCreate(hospitalPhonesData);

    // 6. Insert Hospital Galleries (one image per hospital)
    const hospitalGalleriesData = [
      { hospital_id: hospitals[0].hospital_id, image_url: 'https://i.pinimg.com/736x/32/26/fa/3226fae8c2fd31e1c49f441c36ed100c.jpg' },
      { hospital_id: hospitals[1].hospital_id, image_url: 'https://i.pinimg.com/474x/3a/9f/85/3a9f85a983a5b585ddd42ad98f907173.jpg' },
      { hospital_id: hospitals[2].hospital_id, image_url: 'https://i.pinimg.com/474x/1f/3c/14/1f3c1433a44c8e3b89d1764b41f91336.jpg' },
      { hospital_id: hospitals[3].hospital_id, image_url: 'https://i.pinimg.com/474x/6e/38/22/6e38228f32905c8304b8065250b6e42e.jpg' },
      { hospital_id: hospitals[4].hospital_id, image_url: 'https://i.pinimg.com/474x/e3/53/c5/e353c5f23d2018595651c152296b4980.jpg' },
      { hospital_id: hospitals[5].hospital_id, image_url: 'https://i.pinimg.com/474x/ba/13/bd/ba13bd2609bdf4055a443b238f095535.jpg' },
      { hospital_id: hospitals[6].hospital_id, image_url: 'https://i.pinimg.com/474x/9b/e9/f1/9be9f1a49b4aa3415102a9d97aef2c02.jpg' },
      { hospital_id: hospitals[7].hospital_id, image_url: 'https://i.pinimg.com/474x/3c/e8/6e/3ce86e419a4b3bbaa6fb67cc3c0ea856.jpg' },
      { hospital_id: hospitals[8].hospital_id, image_url: 'https://i.pinimg.com/474x/0e/3c/05/0e3c0532640f7be06f9d2966ec0a0bc3.jpg' },
      { hospital_id: hospitals[9].hospital_id, image_url: 'https://i.pinimg.com/474x/a5/67/87/a5678795a0c706ef3c0b7cc184db8d57.jpg' },
    ];
    await HospitalGallery.bulkCreate(hospitalGalleriesData);

    // 7. Insert Facilities
    const facilitiesData = [
      { name: 'X-Ray' },
      { name: 'MRI' },
      { name: 'CT Scan' },
      { name: 'Pharmacy' },
      { name: 'Ambulance' },
      { name: 'ICU' },
      { name: 'Cardiology' },
      { name: 'Neurology' },
      { name: 'Pediatrics' },
      { name: 'Emergency Room' }
    ];
    const facilities = await Facility.bulkCreate(facilitiesData);

    // 8. Insert Hospital Facilities (join table) – one facility for each hospital
    const hospitalFacilitiesData = [
      { hospital_id: hospitals[0].hospital_id, facility_id: facilities[0].facility_id },
      { hospital_id: hospitals[1].hospital_id, facility_id: facilities[1].facility_id },
      { hospital_id: hospitals[2].hospital_id, facility_id: facilities[2].facility_id },
      { hospital_id: hospitals[3].hospital_id, facility_id: facilities[3].facility_id },
      { hospital_id: hospitals[4].hospital_id, facility_id: facilities[4].facility_id },
      { hospital_id: hospitals[5].hospital_id, facility_id: facilities[5].facility_id },
      { hospital_id: hospitals[6].hospital_id, facility_id: facilities[6].facility_id },
      { hospital_id: hospitals[7].hospital_id, facility_id: facilities[7].facility_id },
      { hospital_id: hospitals[8].hospital_id, facility_id: facilities[8].facility_id },
      { hospital_id: hospitals[9].hospital_id, facility_id: facilities[9].facility_id },
    ];
    await HospitalFacility.bulkCreate(hospitalFacilitiesData);

    // 9. Insert Doctors (using Kurdish names)
    const doctorsData = [
      { first_name: 'Hemin', last_name: 'Abdullah', title: 'MD', bio: 'Expert in general medicine', year_starting_work: 2005, image_url: 'https://i.pinimg.com/736x/6c/6e/d7/6c6ed7f4011b7f926b3f1505475aba16.jpg' },
      { first_name: 'Berivan', last_name: 'Jalal', title: 'Surgeon', bio: 'Specialist in surgery', year_starting_work: 2008, image_url: 'https://i.pinimg.com/736x/41/27/76/4127760eda016c4eb150e1a7225bc7a8.jpg' },
      { first_name: 'Zana', last_name: 'Karim', title: 'Pediatrician', bio: 'Focused on child health', year_starting_work: 2010, image_url: 'https://i.pinimg.com/474x/a9/56/b1/a956b102778d9078e5b2c1201c5c90ec.jpg' },
      { first_name: 'Rojin', last_name: 'Hassan', title: 'Orthopedic', bio: 'Expert in bone and joint surgery', year_starting_work: 2003, image_url: 'https://i.pinimg.com/474x/0d/d0/97/0dd09727d2c91e9b0072f59317854f50.jpg' },
      { first_name: 'Shivan', last_name: 'Azad', title: 'Dermatologist', bio: 'Skilled in skin treatments', year_starting_work: 2009, image_url: 'https://i.pinimg.com/474x/8b/e0/f2/8be0f209bc6f23aacffb27aa3c2b2e2d.jpg' },
      { first_name: 'Avin', last_name: 'Soran', title: 'Neurologist', bio: 'Specialist in brain health', year_starting_work: 2007, image_url: 'https://i.pinimg.com/474x/40/72/0f/40720fef1c1b0a96df2f0132c6ded59c.jpg' },
      { first_name: 'Nazar', last_name: 'Qadir', title: 'Gynecologist', bio: 'Experienced in women’s health', year_starting_work: 2012, image_url: 'https://i.pinimg.com/736x/ad/6c/b0/ad6cb07e44a5e63ffc89d7723b181052.jpg' },
      { first_name: 'Hor', last_name: 'Jon', title: 'General Practitioner', bio: 'Family medicine expert', year_starting_work: 2000, image_url: 'https://i.pinimg.com/736x/8e/c3/ed/8ec3edc3236fc4a558385c128fb2d4cb.jpg' },
      { first_name: 'Choman', last_name: 'Aso', title: 'Cardiologist', bio: 'Expert in heart conditions', year_starting_work: 2004, image_url: 'https://i.pinimg.com/474x/6d/b4/4f/6db44f206bb332cd749c5e92ed9bfa91.jpg' },
      { first_name: 'Aram', last_name: 'Barzani', title: 'Radiologist', bio: 'Skilled in diagnostic imaging', year_starting_work: 2006, image_url: 'https://i.pinimg.com/474x/0d/1e/82/0d1e8268dd98805f486459b18b7868ee.jpg' }
    ];
    const doctors = await Doctor.bulkCreate(doctorsData);

    // 10. Insert Doctor Certifications (with awarding_institution)
    const doctorCertificationsData = [
      { doctor_id: doctors[0].doctor_id, certification_name: 'General Medicine Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2010-01-15' },
      { doctor_id: doctors[1].doctor_id, certification_name: 'Surgery Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2011-03-20' },
      { doctor_id: doctors[2].doctor_id, certification_name: 'Pediatrics Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2012-05-10' },
      { doctor_id: doctors[3].doctor_id, certification_name: 'Orthopedic Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2009-07-22' },
      { doctor_id: doctors[4].doctor_id, certification_name: 'Dermatology Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2013-09-05' },
      { doctor_id: doctors[5].doctor_id, certification_name: 'Neurology Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2010-11-12' },
      { doctor_id: doctors[6].doctor_id, certification_name: 'Gynecology Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2014-02-28' },
      { doctor_id: doctors[7].doctor_id, certification_name: 'General Practice Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2008-04-16' },
      { doctor_id: doctors[8].doctor_id, certification_name: 'Cardiology Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2011-06-30' },
      { doctor_id: doctors[9].doctor_id, certification_name: 'Radiology Certification', awarding_institution: 'Kurdistan Medical Board', awarded_date: '2010-08-21' }
    ];
    await DoctorCertification.bulkCreate(doctorCertificationsData);

    // 11. Insert Doctor Hospitals (join table for doctor availability)
    const doctorHospitalsData = [
      { doctor_id: doctors[0].doctor_id, hospital_id: hospitals[0].hospital_id, available_from: '08:00:00', available_until: '16:00:00' },
      { doctor_id: doctors[1].doctor_id, hospital_id: hospitals[1].hospital_id, available_from: '09:00:00', available_until: '17:00:00' },
      { doctor_id: doctors[2].doctor_id, hospital_id: hospitals[2].hospital_id, available_from: '10:00:00', available_until: '18:00:00' },
      { doctor_id: doctors[3].doctor_id, hospital_id: hospitals[3].hospital_id, available_from: '07:30:00', available_until: '15:30:00' },
      { doctor_id: doctors[4].doctor_id, hospital_id: hospitals[4].hospital_id, available_from: '08:30:00', available_until: '16:30:00' },
      { doctor_id: doctors[5].doctor_id, hospital_id: hospitals[5].hospital_id, available_from: '09:30:00', available_until: '17:30:00' },
      { doctor_id: doctors[6].doctor_id, hospital_id: hospitals[6].hospital_id, available_from: '07:00:00', available_until: '15:00:00' },
      { doctor_id: doctors[7].doctor_id, hospital_id: hospitals[7].hospital_id, available_from: '08:00:00', available_until: '16:00:00' },
      { doctor_id: doctors[8].doctor_id, hospital_id: hospitals[8].hospital_id, available_from: '10:00:00', available_until: '18:00:00' },
      { doctor_id: doctors[9].doctor_id, hospital_id: hospitals[9].hospital_id, available_from: '09:00:00', available_until: '17:00:00' }
    ];
    await DoctorHospital.bulkCreate(doctorHospitalsData);

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// --- Express route to trigger database seeding ---
router.get('/', async (req, res) => {
  try {
    await seedDatabase();
    res.send("Database seeded successfully!");
  } catch (err) {
    console.error("Seeding failed:", err);
    res.status(500).send("Error seeding database.");
  }
});

module.exports = router;
