const express = require('express');
const router = express.Router();
const { Hospital, Doctor, HospitalPhone, HospitalFacility, Area, City, Country, DoctorCertification, HospitalUser, User } = require('../models');
const { Op } = require('sequelize');
const { ensureAuthenticated, ensureStatus, ensureRole } = require('../middlewares/auth.js');

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        
        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { summary: { [Op.like]: `%${search}%` } },
                    { address: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const hospitals = await Hospital.findAll({
            where: whereClause,
            include: [
                {
                    model: Area,
                    include: [
                        {
                            model: City,
                            include: [Country]
                        }
                    ]
                },
                {
                    model: HospitalPhone
                },
                {
                    model: HospitalFacility
                },
                {
                    model: Doctor,
                    through: { attributes: [] }
                }
            ]
        });
        console.log(hospitals);
        res.render('hospitals/index', { hospitals, search, title: 'Hospitals' });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).render('error', { message: 'Failed to fetch hospitals' });
    }
});

router.get('/create', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const areas = await Area.findAll({
            include: [{
                model: City,
                include: [Country]
            }]
        });
        res.render('hospitals/create', { areas, title: 'Create Hospital' });
    } catch (error) {
        console.error('Error loading create hospital form:', error);
        res.status(500).render('error', { message: 'Failed to load create form' });
    }
});

router.post('/create', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const {
            name,
            area_id,
            summary,
            emergency_status,
            address,
            contact_email,
            website,
            is_private,
            phone_numbers,
            facilities
        } = req.body;

        const hospital = await Hospital.create({
            name,
            area_id,
            summary,
            emergency_status: emergency_status === 'true',
            address,
            contact_email,
            website,
            is_private: is_private === 'true'
        });

        if (phone_numbers && Array.isArray(phone_numbers)) {
            await Promise.all(phone_numbers.map(phone =>
                HospitalPhone.create({
                    hospital_id: hospital.hospital_id,
                    phone_number: phone
                })
            ));
        }

        if (facilities && Array.isArray(facilities)) {
            await Promise.all(facilities.map(facility =>
                HospitalFacility.create({
                    hospital_id: hospital.hospital_id,
                    facility_name: facility
                })
            ));
        }

        res.redirect(`/hospitals/${hospital.hospital_id}`);
    } catch (error) {
        console.error('Error creating hospital:', error);
        res.status(500).render('error', { message: 'Failed to create hospital' });
    }
});

router.get('/:id/edit', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id, {
            include: [
                {
                    model: Area,
                    include: [{
                        model: City,
                        include: [Country]
                    }]
                },
                HospitalPhone,
                HospitalFacility
            ]
        });

        if (!hospital) {
            return res.status(404).render('error', { message: 'Hospital not found' });
        }

        const areas = await Area.findAll({
            include: [{
                model: City,
                include: [Country]
            }]
        });

        res.render('hospitals/edit', { hospital, areas, title: `Edit ${hospital.name}` });
    } catch (error) {
        console.error('Error loading edit hospital form:', error);
        res.status(500).render('error', { message: 'Failed to load edit form' });
    }
});

router.post('/:id/edit', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id);
        if (!hospital) {
            return res.status(404).render('error', { message: 'Hospital not found' });
        }

        const {
            name,
            area_id,
            summary,
            emergency_status,
            address,
            contact_email,
            website,
            is_private,
            phone_numbers,
            facilities
        } = req.body;

        await hospital.update({
            name,
            area_id,
            summary,
            emergency_status: emergency_status === 'true',
            address,
            contact_email,
            website,
            is_private: is_private === 'true'
        });

        if (phone_numbers && Array.isArray(phone_numbers)) {
            await HospitalPhone.destroy({
                where: { hospital_id: hospital.hospital_id }
            });
            await Promise.all(phone_numbers.map(phone =>
                HospitalPhone.create({
                    hospital_id: hospital.hospital_id,
                    phone_number: phone
                })
            ));
        }

        if (facilities && Array.isArray(facilities)) {
            await HospitalFacility.destroy({
                where: { hospital_id: hospital.hospital_id }
            });
            await Promise.all(facilities.map(facility =>
                HospitalFacility.create({
                    hospital_id: hospital.hospital_id,
                    facility_name: facility
                })
            ));
        }

        res.redirect(`/hospitals/${hospital.hospital_id}`);
    } catch (error) {
        console.error('Error updating hospital:', error);
        res.status(500).render('error', { message: 'Failed to update hospital' });
    }
});


router.post('/:id/request', ensureAuthenticated, ensureStatus('accept'), async (req, res) => {
    try {
        const user_id = req.session.user.id; // Assuming user ID is stored in session
        const hospital = await Hospital.findByPk(req.params.id);
        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        // Check if the user already has a pending request
        const existingRequest = await HospitalUser.findOne({
            where: {
                user_id,
                status: 'pending'
            }
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending request. Please wait for it to be processed before making another request.' });
        }

        console.log('Request body:', req.body);
        console.log('User ID:', user_id);
        console.log('Hospital ID:', hospital.hospital_id);

        let { request_message, privacy_policy_agreement, terms_of_service_agreement } = req.body;
        privacy_policy_agreement = privacy_policy_agreement == 'on' ? true : false;
        terms_of_service_agreement = terms_of_service_agreement == 'on' ? true : false;

        console.log('Request message:', request_message);
        console.log('Privacy policy agreement:', privacy_policy_agreement);
        console.log('Terms of service agreement:', terms_of_service_agreement);

        const hospitalUser = await HospitalUser.create({
            hospital_id: req.params.id,
            user_id,
            status: 'pending',
            request_message,
            privacy_policy_agreement,
            terms_of_service_agreement,
        });

        console.log('Request sent to hospital:', hospitalUser);
        res.redirect(`/users/getprofile`);
    } catch (error) {
        console.error('Error sending request:', error);
        res.status(500).json({ message: 'Failed to send request' });
    }
});

router.get('/requests', ensureAuthenticated, ensureStatus('accept'), ensureRole('admin'), async (req, res) => {
    console.log("Fetching hospital users for admin view");
    console.log('User session:', req.session.user); // Log the user session for debugging
    console.log('User role:', req.session.user.role); // Log the user role for debugging
    console.log('User status:', req.session.user.status); // Log the user status for debugging
    console.log('User ID:', req.session.user.id); // Log the user ID for debugging
    console.log('User email:', req.session.user.email); // Log the user email for debugging
    console.log('User name:', req.session.user.name); // Log the user name for debugging
    
    try {
        const hospitalUsers = await HospitalUser.findAll({
            include: [
                {
                    model: Hospital,
                    attributes: ['name']
                },
                {
                    model: User,
                    attributes: ['first_name', 'last_name', 'email']
                }
            ]
        });
        hospitalUsers.forEach(user => {
            console.log('Hospital names:', user.hospital.name); // Log each hospital user for debugging
        });
        
        
        res.render('hospitals/requests', { hospitalUsers, title: 'Hospital Users' });
    } catch (error) {
        console.error('Error fetching hospital users:', error);
        res.status(500).render('error', { message: 'Failed to fetch hospital users' });
    }
});

router.post('/requests/:id/accept', ensureAuthenticated, ensureStatus('accept'), ensureRole('admin'), async (req, res) => {
    try {
        const hospitalUser = await HospitalUser.findByPk(req.params.id);
        if (!hospitalUser) {
            return res.status(404).json({ message: 'Request not found' });
        }
        await hospitalUser.update({ status: 'accept' });
        console.log('Request accepted:', hospitalUser);
        res.redirect('/hospitals/requests');
    } catch (error) {
        console.error('Error accepting request:', error);
        res.status(500).json({ message: 'Failed to accept request' });
    }
});

router.post('/requests/:id/reject', ensureAuthenticated, ensureStatus('accept'), ensureRole('admin'), async (req, res) => {
    try {
        const hospitalUser = await HospitalUser.findByPk(req.params.id);
        if (!hospitalUser) {
            return res.status(404).json({ message: 'Request not found' });
        }
        await hospitalUser.update({ status: 'reject' });
        console.log('Request rejected:', hospitalUser);
        res.redirect('/hospitals/requests');
    } catch (error) {
        console.error('Error rejecting request:', error);
        res.status(500).json({ message: 'Failed to reject request' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching hospital with ID:', req.params.id);
        
        const hospital = await Hospital.findByPk(req.params.id, {
            include: [
                {
                    model: Area,
                    include: [
                        {
                            model: City,
                            include: [Country]
                        }
                    ]
                },
                {
                    model: HospitalPhone
                },
                {
                    model: HospitalFacility
                },
                {
                    model: Doctor,
                    include: [DoctorCertification],
                    through: { attributes: [] }
                }
            ]
        });
        
        console.log('Hospital fetched:', hospital);
        
        if (!hospital) {
            console.log('Hospital not found');
            return res.status(404).render('error', { message: 'Hospital not found' });
        }
        
        console.log('Rendering hospital profile');
        res.render('hospitals/profile', { hospital, title: hospital.name });
    } catch (error) {
        console.error('Error fetching hospital profile:', error);
        res.status(500).render('error', { message: 'Failed to fetch hospital profile' });
    }
});

module.exports = router;