const express = require('express');
const router = express.Router();
const { Doctor, DoctorCertification, Hospital, Area, City, Country } = require('../models');
const { Op } = require('sequelize');
const { ensureAuthenticated, ensureStatus } = require('../middlewares/auth');

router.get('/', async (req, res) => {
    try {
        console.log('GET /doctors - Request query params:', req.query);

        let { search, country, city, area, hospital, page, limit } = req.query;

        // Normalize empty strings to undefined
        search = search && search.trim() ? search.trim() : undefined;
        country = country && country !== '' ? country : undefined;
        city = city && city !== '' ? city : undefined;
        area = area && area !== '' ? area : undefined;
        hospital = hospital && hospital !== '' ? hospital : undefined;

        // Pagination defaults
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 9;
        const offset = (page - 1) * limit;

        // Build the query
        let whereClause = {};
        if (search) {
            whereClause = {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { title: { [Op.like]: `%${search}%` } },
                    { bio: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Build hospital/area/city/country filter for the include
        let hospitalInclude = {
            model: Hospital,
            include: [{
                model: Area,
                include: [{
                    model: City,
                    include: [Country]
                }]
            }],
            through: { attributes: [] }
        };

        // Add where clauses to the nested include
        if (hospital) {
            hospitalInclude.where = { hospital_id: hospital };
        } else if (area) {
            hospitalInclude.where = { area_id: area };
        } else if (city) {
            hospitalInclude.include[0].where = { city_id: city };
        } else if (country) {
            hospitalInclude.include[0].include[0].where = { country_id: country };
        }

        // Fetch doctors with all the filters applied and pagination
        const { count, rows: doctors } = await Doctor.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: DoctorCertification,
                    attributes: ['title', 'degree_level', 'awarding_institution']
                },
                hospitalInclude
            ],
            offset,
            limit
        });

        // Fetch all countries for the filter dropdowns
        const countries = await Country.findAll({ order: [['name', 'ASC']] });

        // Fetch cities based on selected country
        let cities = [];
        if (country) {
            cities = await City.findAll({
                where: { country_id: country },
                order: [['name', 'ASC']]
            });
        }

        // Fetch areas based on selected city
        let areas = [];
        if (city) {
            areas = await Area.findAll({
                where: { city_id: city },
                order: [['name', 'ASC']]
            });
        }

        // Fetch hospitals based on selected area
        let hospitals = [];
        if (area) {
            hospitals = await Hospital.findAll({
                where: { area_id: area },
                order: [['name', 'ASC']]
            });
        }

        const totalPages = Math.ceil(count / limit);

        res.render('doctors/index', {
            doctors,
            search: search || '',
            countries,
            cities,
            areas,
            hospitals,
            selectedCountry: country || '',
            selectedCity: city || '',
            selectedArea: area || '',
            selectedHospital: hospital || '',
            title: 'Doctors',
            currentPage: page,
            totalPages,
            limit
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        console.error('Error stack:', error.stack);
        res.status(500).render('error', { message: 'Failed to fetch doctors' });
    }
});

router.get('/create', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const hospitals = await Hospital.findAll({
            include: [{
                model: Area,
                include: [{
                    model: City,
                    include: [Country]
                }]
            }]
        });
        res.render('doctors/create', { hospitals, title: 'Create Doctor' });
    } catch (error) {
        console.error('Error loading create doctor form:', error);
        res.status(500).render('error', { message: 'Failed to load create form' });
    }
});

router.post('/create', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            title,
            bio,
            image_url,
            certifications,
            hospitals
        } = req.body;

        const doctor = await Doctor.create({
            first_name,
            last_name,
            title,
            bio,
            image_url
        });

        if (certifications && Array.isArray(certifications)) {
            await Promise.all(certifications.map(cert => 
                DoctorCertification.create({
                    ...cert,
                    doctor_id: doctor.doctor_id
                })
            ));
        }

        if (hospitals && Array.isArray(hospitals)) {
            await doctor.setHospitals(hospitals);
        }

        res.redirect(`/doctors/${doctor.doctor_id}`);
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).render('error', { message: 'Failed to create doctor' });
    }
});

router.get('/:id/edit',ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                DoctorCertification,
                {
                    model: Hospital,
                    through: { attributes: [] }
                }
            ]
        });

        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }

        const hospitals = await Hospital.findAll({
            include: [{
                model: Area,
                include: [{
                    model: City,
                    include: [Country]
                }]
            }]
        });

        res.render('doctors/edit', { doctor, hospitals, title: 'Edit Doctor' });
    } catch (error) {
        console.error('Error loading edit doctor form:', error);
        res.status(500).render('error', { message: 'Failed to load edit form' });
    }
});

router.post('/:id/edit', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id);
        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }

        const {
            first_name,
            last_name,
            title,
            bio,
            image_url,
            certifications,
            hospitals
        } = req.body;

        await doctor.update({
            first_name,
            last_name,
            title,
            bio,
            image_url
        });

        if (certifications && Array.isArray(certifications)) {
            await DoctorCertification.destroy({
                where: { doctor_id: doctor.doctor_id }
            });
            await Promise.all(certifications.map(cert =>
                DoctorCertification.create({
                    ...cert,
                    doctor_id: doctor.doctor_id
                })
            ));
        }

        if (hospitals && Array.isArray(hospitals)) {
            await doctor.setHospitals(hospitals);
        }

        res.redirect(`/doctors/${doctor.doctor_id}`);
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).render('error', { message: 'Failed to update doctor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                {
                    model: DoctorCertification,
                    attributes: ['title', 'degree_level', 'awarding_institution', 'awarded_date']
                },
                {
                    model: Hospital,
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }
        
        res.render('doctors/profile', { doctor, title: 'Doctor Profile' });
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).render('error', { message: 'Failed to fetch doctor profile' });
    }
});

module.exports = router;

// GET /doctors - List all doctors with filtering
router.get('/', async (req, res) => {
  try {
    console.log('Incoming request query parameters:', req.query);
    const { search, country, city, area, hospital } = req.query;
    
    let whereClause = {};
    let includeOptions = [
      {
        model: db.DoctorCertification,
        as: 'doctor_certifications'
      },
      {
        model: db.Hospital,
        as: 'hospitals',
        include: [
          {
            model: db.Area,
            as: 'area',
            include: [
              {
                model: db.City,
                as: 'city',
                include: [
                  {
                    model: db.Country,
                    as: 'country'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    // Search by name
    if (search) {
      whereClause = {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } }
        ]
      };
      console.log('Search where clause:', whereClause);
    }

    // Get all countries for the filter dropdown
    const countries = await db.Country.findAll({
      order: [['name', 'ASC']]
    });
    console.log('Retrieved countries count:', countries.length);

    // Initialize variables for selected filters
    let cities = [];
    let areas = [];
    let hospitals = [];
    let selectedCountry = country ? parseInt(country) : null;
    let selectedCity = city ? parseInt(city) : null;
    let selectedArea = area ? parseInt(area) : null;
    let selectedHospital = hospital ? parseInt(hospital) : null;

    console.log('Selected filters:', {
      selectedCountry,
      selectedCity,
      selectedArea,
      selectedHospital
    });

    // If country is selected, get cities
    if (selectedCountry) {
      cities = await db.City.findAll({
        where: { country_id: selectedCountry },
        order: [['name', 'ASC']]
      });
      console.log('Cities found for country:', cities.length);
    }

    // If city is selected, get areas
    if (selectedCity) {
      areas = await db.Area.findAll({
        where: { city_id: selectedCity },
        order: [['name', 'ASC']]
      });
      console.log('Areas found for city:', areas.length);
    }

    // If area is selected, get hospitals
    if (selectedArea) {
      hospitals = await db.Hospital.findAll({
        where: { area_id: selectedArea },
        order: [['name', 'ASC']]
      });
      console.log('Hospitals found for area:', hospitals.length);
    }

    // Apply location filters to the query
    if (selectedHospital) {
      const doctorIds = await db.DoctorHospital.findAll({
        where: { hospital_id: selectedHospital },
        attributes: ['doctor_id']
      });
      console.log('Doctor IDs found for hospital:', doctorIds.length);
      
      whereClause.doctor_id = {
        [Op.in]: doctorIds.map(dh => dh.doctor_id)
      };
    } else if (selectedArea) {
      const hospitalsInArea = await db.Hospital.findAll({
        where: { area_id: selectedArea },
        attributes: ['hospital_id']
      });
      console.log('Hospitals found in area:', hospitalsInArea.length);
      
      const doctorIds = await db.DoctorHospital.findAll({
        where: { 
          hospital_id: {
            [Op.in]: hospitalsInArea.map(h => h.hospital_id)
          }
        },
        attributes: ['doctor_id']
      });
      console.log('Doctor IDs found in area:', doctorIds.length);
      
      whereClause.doctor_id = {
        [Op.in]: doctorIds.map(dh => dh.doctor_id)
      };
    } else if (selectedCity) {
      const areasInCity = await db.Area.findAll({
        where: { city_id: selectedCity },
        attributes: ['area_id']
      });
      console.log('Areas found in city:', areasInCity.length);
      
      const hospitalsInAreas = await db.Hospital.findAll({
        where: { 
          area_id: {
            [Op.in]: areasInCity.map(a => a.area_id)
          }
        },
        attributes: ['hospital_id']
      });
      console.log('Hospitals found in city areas:', hospitalsInAreas.length);
      
      const doctorIds = await db.DoctorHospital.findAll({
        where: { 
          hospital_id: {
            [Op.in]: hospitalsInAreas.map(h => h.hospital_id)
          }
        },
        attributes: ['doctor_id']
      });
      console.log('Doctor IDs found in city:', doctorIds.length);
      
      whereClause.doctor_id = {
        [Op.in]: doctorIds.map(dh => dh.doctor_id)
      };
    } else if (selectedCountry) {
      const citiesInCountry = await db.City.findAll({
        where: { country_id: selectedCountry },
        attributes: ['city_id']
      });
      console.log('Cities found in country:', citiesInCountry.length);
      
      const areasInCities = await db.Area.findAll({
        where: { 
          city_id: {
            [Op.in]: citiesInCountry.map(c => c.city_id)
          }
        },
        attributes: ['area_id']
      });
      console.log('Areas found in country cities:', areasInCities.length);
      
      const hospitalsInAreas = await db.Hospital.findAll({
        where: { 
          area_id: {
            [Op.in]: areasInCities.map(a => a.area_id)
          }
        },
        attributes: ['hospital_id']
      });
      console.log('Hospitals found in country areas:', hospitalsInAreas.length);
      
      const doctorIds = await db.DoctorHospital.findAll({
        where: { 
          hospital_id: {
            [Op.in]: hospitalsInAreas.map(h => h.hospital_id)
          }
        },
        attributes: ['doctor_id']
      });
      console.log('Doctor IDs found in country:', doctorIds.length);
      
      whereClause.doctor_id = {
        [Op.in]: doctorIds.map(dh => dh.doctor_id)
      };
    }

    console.log('Final where clause:', whereClause);

    // Get doctors with filters applied
    const doctors = await db.Doctor.findAll({
      where: whereClause,
      include: includeOptions,
      order: [['last_name', 'ASC']]
    });
    console.log('Total doctors found:', doctors.length);

    // Pass all necessary variables to the template
    res.render('doctors/index', { 
      doctors, 
      search, 
      countries, 
      cities, 
      areas, 
      hospitals,
      selectedCountry, 
      selectedCity, 
      selectedArea, 
      selectedHospital 
    });
  } catch (error) {
    console.error('Error details:', error);
    console.error('Error stack trace:', error.stack);
    res.status(500).send('Server error');
  }
});

router.get('/create', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const hospitals = await Hospital.findAll({
            include: [{
                model: Area,
                include: [{
                    model: City,
                    include: [Country]
                }]
            }]
        });
        res.render('doctors/create', { hospitals, title: 'Create Doctor' });
    } catch (error) {
        console.error('Error loading create doctor form:', error);
        res.status(500).render('error', { message: 'Failed to load create form' });
    }
});

router.post('/create', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            title,
            bio,
            image_url,
            certifications,
            hospitals
        } = req.body;

        const doctor = await Doctor.create({
            first_name,
            last_name,
            title,
            bio,
            image_url
        });

        if (certifications && Array.isArray(certifications)) {
            await Promise.all(certifications.map(cert => 
                DoctorCertification.create({
                    ...cert,
                    doctor_id: doctor.doctor_id
                })
            ));
        }

        if (hospitals && Array.isArray(hospitals)) {
            await doctor.setHospitals(hospitals);
        }

        res.redirect(`/doctors/${doctor.doctor_id}`);
    } catch (error) {
        console.error('Error creating doctor:', error);
        res.status(500).render('error', { message: 'Failed to create doctor' });
    }
});

router.get('/:id/edit',ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                DoctorCertification,
                {
                    model: Hospital,
                    through: { attributes: [] }
                }
            ]
        });

        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }

        const hospitals = await Hospital.findAll({
            include: [{
                model: Area,
                include: [{
                    model: City,
                    include: [Country]
                }]
            }]
        });

        res.render('doctors/edit', { doctor, hospitals, title: 'Edit Doctor' });
    } catch (error) {
        console.error('Error loading edit doctor form:', error);
        res.status(500).render('error', { message: 'Failed to load edit form' });
    }
});

router.post('/:id/edit', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id);
        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }

        const {
            first_name,
            last_name,
            title,
            bio,
            image_url,
            certifications,
            hospitals
        } = req.body;

        await doctor.update({
            first_name,
            last_name,
            title,
            bio,
            image_url
        });

        if (certifications && Array.isArray(certifications)) {
            await DoctorCertification.destroy({
                where: { doctor_id: doctor.doctor_id }
            });
            await Promise.all(certifications.map(cert =>
                DoctorCertification.create({
                    ...cert,
                    doctor_id: doctor.doctor_id
                })
            ));
        }

        if (hospitals && Array.isArray(hospitals)) {
            await doctor.setHospitals(hospitals);
        }

        res.redirect(`/doctors/${doctor.doctor_id}`);
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).render('error', { message: 'Failed to update doctor' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                {
                    model: DoctorCertification,
                    attributes: ['title', 'degree_level', 'awarding_institution', 'awarded_date']
                },
                {
                    model: Hospital,
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }
        
        res.render('doctors/profile', { doctor, title: 'Doctor Profile' });
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).render('error', { message: 'Failed to fetch doctor profile' });
    }
});

module.exports = router;