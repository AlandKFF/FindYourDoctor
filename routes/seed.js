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
      { name: 'Sulaymaniyah', country_id: countries[0].country_id },
      { name: 'Erbil', country_id: countries[0].country_id },
      { name: 'Duhok', country_id: countries[0].country_id },
      { name: 'Kirkuk', country_id: countries[0].country_id },
      { name: 'Halabja', country_id: countries[0].country_id }
    ];
    const cities = await City.bulkCreate(citiesData);

    // 3. Insert Areas: each city gets 3 areas with realistic names
    const areasData = [
      // Sulaymaniyah areas
      { name: 'Salim Street', city_id: cities[0].city_id },
      { name: 'Bakhtiari', city_id: cities[0].city_id },
      { name: 'Raperin', city_id: cities[0].city_id },
      // Erbil areas
      { name: 'Ankawa', city_id: cities[1].city_id },
      { name: 'Dream City', city_id: cities[1].city_id },
      { name: 'Italian Village', city_id: cities[1].city_id },
      // Duhok areas
      { name: 'Malta', city_id: cities[2].city_id },
      { name: 'Masike', city_id: cities[2].city_id },
      { name: 'Baroshke', city_id: cities[2].city_id },
      // Kirkuk areas
      { name: 'Rahimawa', city_id: cities[3].city_id },
      { name: 'Shorija', city_id: cities[3].city_id },
      { name: 'Iskan', city_id: cities[3].city_id },
      // Halabja areas
      { name: 'Sirwan', city_id: cities[4].city_id },
      { name: 'Shahidan', city_id: cities[4].city_id },
      { name: 'Kani Ashkan', city_id: cities[4].city_id }
    ];
    const areas = await Area.bulkCreate(areasData);

    // 4. Insert Hospitals with more realistic data
    const hospitalsData = [
      // Salim Street hospitals (area 0)
      { area_id: areas[0].area_id, name: 'Shar Teaching Hospital', summary: 'Major public teaching hospital serving Sulaymaniyah governorate since 1960.', emergency_status: true, address: 'Malik Mahmud Ring Road, Sulaymaniyah, Kurdistan Region, Iraq', contact_email: 'info@sharteaching.health.gov.iq', website: 'http://sharteaching.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/32/26/fa/3226fae8c2fd31e1c49f441c36ed100c.jpg', status:"active" },
      { area_id: areas[0].area_id, name: 'Faruk Medical City', summary: 'Leading private healthcare facility with international standards and modern equipment.', emergency_status: true, address: 'Malik Mahmood Ring Road, Bakhtiari, Sulaymaniyah', contact_email: 'contact@farukmed.com', website: 'http://farukmed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/c9/96/2f/c9962fdc232fd936824711168e3e0e51.jpg', status:"active" },
      { area_id: areas[0].area_id, name: 'Sulaymaniyah Private Hospital', summary: 'Modern private facility offering comprehensive medical services.', emergency_status: true, address: 'Salem Street, Sulaymaniyah', contact_email: 'info@sulaymaniyahprivate.com', website: 'http://sulaymaniyahprivate.com', is_private: true, image_url: 'https://i.pinimg.com/474x/bc/c0/13/bcc013aa69420dc0f628c713a8e27e78.jpg', status:"active" },

      // Bakhtiari hospitals (area 1)
      { area_id: areas[1].area_id, name: 'Bakhtiari General Hospital', summary: 'Public hospital providing essential healthcare services.', emergency_status: true, address: 'Main Street, Bakhtiari, Sulaymaniyah', contact_email: 'info@bakhtiarihosp.health.gov.iq', website: 'http://bakhtiarihosp.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/48/96/6a/48966a606e239ea04f91ee86d5c7d480.jpg', status:"active" },
      { area_id: areas[1].area_id, name: 'Life Care Center', summary: 'Specialized private medical center focusing on family healthcare.', emergency_status: true, address: 'Bakhtiari Area, Sulaymaniyah', contact_email: 'contact@lifecare.com', website: 'http://lifecare.com', is_private: true, image_url: 'https://i.pinimg.com/474x/33/0a/08/330a08acb77fefab7817660d35c246c5.jpg', status:"active" },
      { area_id: areas[1].area_id, name: 'Bakhtiari Specialty Hospital', summary: 'Advanced specialty hospital with focus on surgical procedures.', emergency_status: true, address: 'Ring Road, Bakhtiari, Sulaymaniyah', contact_email: 'info@bakhtiarispecialty.com', website: 'http://bakhtiarispecialty.com', is_private: true, image_url: 'https://i.pinimg.com/474x/bc/c0/13/bcc013aa69420dc0f628c713a8e27e78.jpg', status:"active" },

      // Raperin hospitals (area 2)
      { area_id: areas[2].area_id, name: 'Raperin Medical Complex', summary: 'Multi-specialty medical complex serving the local community.', emergency_status: true, address: 'Raperin District, Sulaymaniyah', contact_email: 'info@raperinmed.com', website: 'http://raperinmed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/25/ca/d0/25cad068376984dd3329f03405196bf0.jpg', status:"active" },
      { area_id: areas[2].area_id, name: 'Emergency Care Hospital', summary: '24/7 emergency care facility with modern equipment.', emergency_status: true, address: 'Raperin Area, Sulaymaniyah', contact_email: 'emergency@carehosp.com', website: 'http://carehosp.com', is_private: false, image_url: 'https://i.pinimg.com/474x/79/ec/5a/79ec5aca95fb7d4c90aba31e2290d2c7.jpg', status:"active" },
      { area_id: areas[2].area_id, name: 'Raperin Children Hospital', summary: 'Specialized pediatric care facility with modern amenities.', emergency_status: true, address: 'Main Road, Raperin, Sulaymaniyah', contact_email: 'info@raperinchildren.com', website: 'http://raperinchildren.com', is_private: true, image_url: 'https://i.pinimg.com/474x/23/a3/fc/23a3fcb132125c3020ff93dbff2626ed.jpg', status:"active" },

      // Ankawa hospitals (area 3)
      { area_id: areas[3].area_id, name: 'Erbil Teaching Hospital', summary: 'Comprehensive medical center providing advanced healthcare services.', emergency_status: true, address: '60m Street, Ankawa, Erbil', contact_email: 'info@erbilteaching.health.gov.iq', website: 'http://erbilteaching.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/23/a3/fc/23a3fcb132125c3020ff93dbff2626ed.jpg', status:"active" },
      { area_id: areas[3].area_id, name: 'Ankawa Private Hospital', summary: 'Premium healthcare facility with international standards.', emergency_status: true, address: 'Ankawa Main Road, Erbil', contact_email: 'info@ankawaprivate.com', website: 'http://ankawaprivate.com', is_private: true, image_url: 'https://i.pinimg.com/474x/d2/e8/a3/d2e8a392f88fa4e7feba3efa251108ed.jpg', status:"active" },
      { area_id: areas[3].area_id, name: 'St. Joseph Hospital', summary: 'Faith-based hospital providing comprehensive healthcare services.', emergency_status: true, address: 'Church Street, Ankawa, Erbil', contact_email: 'info@stjoseph.com', website: 'http://stjoseph.com', is_private: true, image_url: 'https://i.pinimg.com/474x/48/96/6a/48966a606e239ea04f91ee86d5c7d480.jpg', status:"active" },

      // Dream City hospitals (area 4)
      { area_id: areas[4].area_id, name: 'PAR Hospital', summary: 'Modern private hospital specializing in surgical procedures and intensive care.', emergency_status: true, address: 'Dream City, 100m Road, Erbil', contact_email: 'info@parhospital.com', website: 'http://parhospital.com', is_private: true, image_url: 'https://i.pinimg.com/474x/23/a3/fc/23a3fcb132125c3020ff93dbff2626ed.jpg', status:"active" },
      { area_id: areas[4].area_id, name: 'Dream City Medical Center', summary: 'State-of-the-art medical facility offering comprehensive care.', emergency_status: true, address: 'Dream City, Erbil', contact_email: 'contact@dreamcitymed.com', website: 'http://dreamcitymed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/32/26/fa/3226fae8c2fd31e1c49f441c36ed100c.jpg', status:"active" },
      { area_id: areas[4].area_id, name: 'Royal Care Hospital', summary: 'Luxury healthcare facility with premium medical services.', emergency_status: true, address: 'Villa District, Dream City, Erbil', contact_email: 'info@royalcare.com', website: 'http://royalcare.com', is_private: true, image_url: 'https://i.pinimg.com/474x/c9/96/2f/c9962fdc232fd936824711168e3e0e51.jpg', status:"active" },

      // Italian Village hospitals (area 5)
      { area_id: areas[5].area_id, name: 'Italian Medical Center', summary: 'European standard healthcare facility with specialized departments.', emergency_status: true, address: 'Italian Village, Erbil', contact_email: 'info@italianmed.com', website: 'http://italianmed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/33/0a/08/330a08acb77fefab7817660d35c246c5.jpg', status:"active" },
      { area_id: areas[5].area_id, name: 'Mediterranean Hospital', summary: 'Modern hospital with international medical staff.', emergency_status: true, address: 'Main Street, Italian Village, Erbil', contact_email: 'contact@medhosp.com', website: 'http://medhosp.com', is_private: true, image_url: 'https://i.pinimg.com/474x/25/ca/d0/25cad068376984dd3329f03405196bf0.jpg', status:"active" },

      // Malta hospitals (area 6)
      { area_id: areas[6].area_id, name: 'Duhok Public Hospital', summary: 'Major public healthcare facility serving Duhok region.', emergency_status: true, address: 'Malta District, Duhok', contact_email: 'info@duhokpublic.health.gov.iq', website: 'http://duhokpublic.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/79/ec/5a/79ec5aca95fb7d4c90aba31e2290d2c7.jpg', status:"active" },
      { area_id: areas[6].area_id, name: 'Malta Medical Center', summary: 'Private healthcare center with modern facilities.', emergency_status: true, address: 'Malta Area, Duhok', contact_email: 'info@maltamed.com', website: 'http://maltamed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/d2/e8/a3/d2e8a392f88fa4e7feba3efa251108ed.jpg', status:"active" },

      // Masike hospitals (area 7)
      { area_id: areas[7].area_id, name: 'Masike General Hospital', summary: 'Comprehensive healthcare facility serving local community.', emergency_status: true, address: 'Masike District, Duhok', contact_email: 'info@masikehosp.com', website: 'http://masikehosp.com', is_private: false, image_url: 'https://i.pinimg.com/474x/23/a3/fc/23a3fcb132125c3020ff93dbff2626ed.jpg', status:"active" },
      { area_id: areas[7].area_id, name: 'Family Care Center', summary: 'Family-oriented medical facility with multiple specialties.', emergency_status: true, address: 'Masike Area, Duhok', contact_email: 'info@familycare.com', website: 'http://familycare.com', is_private: true, image_url: 'https://i.pinimg.com/474x/32/26/fa/3226fae8c2fd31e1c49f441c36ed100c.jpg', status:"active" },

      // Baroshke hospitals (area 8)
      { area_id: areas[8].area_id, name: 'Baroshke Medical Complex', summary: 'Multi-specialty medical facility with modern equipment.', emergency_status: true, address: 'Baroshke District, Duhok', contact_email: 'info@baroshkemed.com', website: 'http://baroshkemed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/c9/96/2f/c9962fdc232fd936824711168e3e0e51.jpg', status:"active" },
      { area_id: areas[8].area_id, name: 'Emergency Hospital Baroshke', summary: '24/7 emergency care center with specialized units.', emergency_status: true, address: 'Baroshke Area, Duhok', contact_email: 'emergency@baroshkehosp.com', website: 'http://baroshkehosp.com', is_private: false, image_url: 'https://i.pinimg.com/474x/bc/c0/13/bcc013aa69420dc0f628c713a8e27e78.jpg', status:"active" },

      // Rahimawa hospitals (area 9)
      { area_id: areas[9].area_id, name: 'Kirkuk General Hospital', summary: 'Major public hospital serving Kirkuk region.', emergency_status: true, address: 'Rahimawa District, Kirkuk', contact_email: 'info@kirkukgeneral.health.gov.iq', website: 'http://kirkukgeneral.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/48/96/6a/48966a606e239ea04f91ee86d5c7d480.jpg', status:"active" },
      { area_id: areas[9].area_id, name: 'Rahimawa Private Hospital', summary: 'Modern private healthcare facility with specialized departments.', emergency_status: true, address: 'Rahimawa Area, Kirkuk', contact_email: 'info@rahimawaprivate.com', website: 'http://rahimawaprivate.com', is_private: true, image_url: 'https://i.pinimg.com/474x/33/0a/08/330a08acb77fefab7817660d35c246c5.jpg', status:"active" },

      // Shorija hospitals (area 10)
      { area_id: areas[10].area_id, name: 'Shorija Medical Center', summary: 'Comprehensive medical facility with multiple specialties.', emergency_status: true, address: 'Shorija District, Kirkuk', contact_email: 'info@shorijamed.com', website: 'http://shorijamed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/25/ca/d0/25cad068376984dd3329f03405196bf0.jpg', status:"active" },
      { area_id: areas[10].area_id, name: 'Children Hospital Shorija', summary: 'Specialized pediatric care facility.', emergency_status: true, address: 'Shorija Area, Kirkuk', contact_email: 'info@childrenhosp.com', website: 'http://childrenhosp.com', is_private: false, image_url: 'https://i.pinimg.com/474x/79/ec/5a/79ec5aca95fb7d4c90aba31e2290d2c7.jpg', status:"active" },

      // Iskan hospitals (area 11)
      { area_id: areas[11].area_id, name: 'Iskan General Hospital', summary: 'Public hospital providing essential healthcare services.', emergency_status: true, address: 'Iskan District, Kirkuk', contact_email: 'info@iskangeneral.health.gov.iq', website: 'http://iskangeneral.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/d2/e8/a3/d2e8a392f88fa4e7feba3efa251108ed.jpg', status:"active" },
      { area_id: areas[11].area_id, name: 'Modern Care Hospital', summary: 'Private healthcare facility with advanced medical equipment.', emergency_status: true, address: 'Iskan Area, Kirkuk', contact_email: 'info@moderncare.com', website: 'http://moderncare.com', is_private: true, image_url: 'https://i.pinimg.com/474x/23/a3/fc/23a3fcb132125c3020ff93dbff2626ed.jpg', status:"active" },

      // Sirwan hospitals (area 12)
      { area_id: areas[12].area_id, name: 'Halabja Public Hospital', summary: 'Main public hospital serving Halabja region.', emergency_status: true, address: 'Sirwan District, Halabja', contact_email: 'info@halabjapublic.health.gov.iq', website: 'http://halabjapublic.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/32/26/fa/3226fae8c2fd31e1c49f441c36ed100c.jpg', status:"active" },
      { area_id: areas[12].area_id, name: 'Sirwan Medical Center', summary: 'Private medical center with multiple specialties.', emergency_status: true, address: 'Sirwan Area, Halabja', contact_email: 'info@sirwanmed.com', website: 'http://sirwanmed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/c9/96/2f/c9962fdc232fd936824711168e3e0e51.jpg', status:"active" },

      // Shahidan hospitals (area 13)
      { area_id: areas[13].area_id, name: 'Shahidan General Hospital', summary: 'Public healthcare facility with essential services.', emergency_status: true, address: 'Shahidan District, Halabja', contact_email: 'info@shahidanhosp.health.gov.iq', website: 'http://shahidanhosp.health.gov.iq', is_private: false, image_url: 'https://i.pinimg.com/474x/bc/c0/13/bcc013aa69420dc0f628c713a8e27e78.jpg', status:"active" },
      { area_id: areas[13].area_id, name: 'Family Health Center', summary: 'Family-oriented healthcare facility with modern amenities.', emergency_status: true, address: 'Shahidan Area, Halabja', contact_email: 'info@familyhealth.com', website: 'http://familyhealth.com', is_private: true, image_url: 'https://i.pinimg.com/474x/48/96/6a/48966a606e239ea04f91ee86d5c7d480.jpg', status:"active" },

      // Kani Ashkan hospitals (area 14)
      { area_id: areas[14].area_id, name: 'Kani Ashkan Medical Complex', summary: 'Modern medical complex with comprehensive services.', emergency_status: true, address: 'Kani Ashkan District, Halabja', contact_email: 'info@kaniashkanmed.com', website: 'http://kaniashkanmed.com', is_private: true, image_url: 'https://i.pinimg.com/474x/33/0a/08/330a08acb77fefab7817660d35c246c5.jpg', status:"active" },
      { area_id: areas[14].area_id, name: 'Emergency Care Center', summary: '24/7 emergency facility with specialized care units.', emergency_status: true, address: 'Kani Ashkan Area, Halabja', contact_email: 'emergency@carecenterkani.com', website: 'http://carecenterkani.com', is_private: false, image_url: 'https://i.pinimg.com/474x/25/ca/d0/25cad068376984dd3329f03405196bf0.jpg', status:"active" }
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
      { first_name: 'Nazar', last_name: 'Qadir', title: 'Gynecologist', bio: 'Experienced in womens health', image_url: 'https://i.pinimg.com/736x/ad/6c/b0/ad6cb07e44a5e63ffc89d7723b181052.jpg' },
      { first_name: 'Hor', last_name: 'Jon', title: 'General Practitioner', bio: 'Family medicine expert', image_url: 'https://i.pinimg.com/736x/8e/c3/ed/8ec3edc3236fc4a558385c128fb2d4cb.jpg' },
      { first_name: 'Choman', last_name: 'Aso', title: 'Cardiologist', bio: 'Expert in heart conditions', image_url: 'https://i.pinimg.com/474x/6d/b4/4f/6db44f206bb332cd749c5e92ed9bfa91.jpg' },
      { first_name: 'Aram', last_name: 'Barzani', title: 'Radiologist', bio: 'Skilled in diagnostic imaging', image_url: 'https://i.pinimg.com/474x/0d/1e/82/0d1e8268dd98805f486459b18b7868ee.jpg' },
      { first_name: 'Sara', last_name: 'Ahmed', title: 'Cardiologist', bio: 'Specialized in cardiovascular care', image_url: 'https://i.pinimg.com/474x/40/72/0f/40720fef1c1b0a96df2f0132c6ded59c.jpg' },
      { first_name: 'Dara', last_name: 'Omar', title: 'Neurologist', bio: 'Expert in neurological disorders', image_url: 'https://i.pinimg.com/474x/8b/e0/f2/8be0f209bc6f23aacffb27aa3c2b2e2d.jpg' },
      { first_name: 'Lana', last_name: 'Rashid', title: 'Pediatrician', bio: 'Specialized in child development', image_url: 'https://i.pinimg.com/474x/a9/56/b1/a956b102778d9078e5b2c1201c5c90ec.jpg' },
      { first_name: 'Hawre', last_name: 'Salih', title: 'Surgeon', bio: 'Expert in general surgery', image_url: 'https://i.pinimg.com/736x/41/27/76/4127760eda016c4eb150e1a7225bc7a8.jpg' },
      { first_name: 'Zhila', last_name: 'Kamal', title: 'Dermatologist', bio: 'Expert in skin care', image_url: 'https://i.pinimg.com/474x/8b/e0/f2/8be0f209bc6f23aacffb27aa3c2b2e2d.jpg' },
      // Additional doctors
      { first_name: 'Karzan', last_name: 'Mohammed', title: 'Orthopedic', bio: 'Specialist in sports medicine', image_url: 'https://i.pinimg.com/474x/0d/d0/97/0dd09727d2c91e9b0072f59317854f50.jpg' },
      { first_name: 'Shad', last_name: 'Nawzad', title: 'Cardiologist', bio: 'Expert in heart surgery', image_url: 'https://i.pinimg.com/474x/6d/b4/4f/6db44f206bb332cd749c5e92ed9bfa91.jpg' },
      { first_name: 'Rezan', last_name: 'Hadi', title: 'Neurologist', bio: 'Specialized in brain surgery', image_url: 'https://i.pinimg.com/474x/40/72/0f/40720fef1c1b0a96df2f0132c6ded59c.jpg' },
      { first_name: 'Shno', last_name: 'Karim', title: 'Pediatrician', bio: 'Expert in newborn care', image_url: 'https://i.pinimg.com/474x/a9/56/b1/a956b102778d9078e5b2c1201c5c90ec.jpg' },
      { first_name: 'Hana', last_name: 'Ali', title: 'Gynecologist', bio: 'Specialized in womens health', image_url: 'https://i.pinimg.com/736x/ad/6c/b0/ad6cb07e44a5e63ffc89d7723b181052.jpg' }
    ];
    const doctors = await Doctor.bulkCreate(doctorsData);

    // 8. Insert Doctor Certifications
    const doctorCertificationsData = doctors.map((doctor, index) => ({
      doctor_id: doctor.doctor_id,
      title: `${doctor.title} Certification`,
      degree_level: 'Level 1',
      awarding_institution: 'Kurdistan Medical Board',
      awarded_date: `${2010 + (index % 5)}-${String(index % 12 + 1).padStart(2, '0')}-${String(index % 28 + 1).padStart(2, '0')}`
    }));
    await DoctorCertification.bulkCreate(doctorCertificationsData);

    // 9. Insert Doctor Hospitals (join table) - at least 2 doctors per hospital
    const doctorHospitalsData = [
      // Shar Teaching Hospital (hospital 0)
      { doctor_id: doctors[0].doctor_id, hospital_id: hospitals[0].hospital_id },
      { doctor_id: doctors[10].doctor_id, hospital_id: hospitals[0].hospital_id },
      { doctor_id: doctors[15].doctor_id, hospital_id: hospitals[0].hospital_id },
      
      // Faruk Medical City (hospital 1)
      { doctor_id: doctors[1].doctor_id, hospital_id: hospitals[1].hospital_id },
      { doctor_id: doctors[11].doctor_id, hospital_id: hospitals[1].hospital_id },
      { doctor_id: doctors[16].doctor_id, hospital_id: hospitals[1].hospital_id },
      
      // Each subsequent hospital gets at least 2 doctors
      ...hospitals.slice(2).flatMap((hospital, index) => [
        { doctor_id: doctors[(index * 2 + 2) % doctors.length].doctor_id, hospital_id: hospital.hospital_id },
        { doctor_id: doctors[(index * 2 + 3) % doctors.length].doctor_id, hospital_id: hospital.hospital_id },
        { doctor_id: doctors[(index * 2 + 17) % doctors.length].doctor_id, hospital_id: hospital.hospital_id }
      ])
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
