import { Router } from "express";
import * as auth from '../controllers/auth';
import * as events from "../controllers/events";
import * as groups from "../controllers/groups";
import * as people from "../controllers/people";


const router = Router();

router.post('/login', auth.login);
router.get('/ping', auth.validade, (req, res) => res.json({pong: true, admin: true}) );

router.get('/events', auth.validade, events.getAll);
router.get('/events/:id', auth.validade, events.getEvent);
router.post('/events', auth.validade, events.addEvent);
router.put('/events/:id', auth.validade, events.updateEvent);
router.delete('/events/:id', auth.validade, events.deleteEvent);

router.get('/events/:id_event/groups', auth.validade, groups.getAll);
router.get('/events/:id_event/groups/:id', auth.validade, groups.getGroup);
router.post('/events/:id_event/groups', auth.validade, groups.addGroup);
router.put('/events/:id_event/groups/:id', auth.validade, groups.updateGroup)
router.delete('/events/:id_event/groups/:id', auth.validade, groups.deleteGroup);

router.get('/events/:id_event/groups/:id_group/people', auth.validade, people.getAll);
router.get('/events/:id_event/groups/:id_group/people/:id', auth.validade, people.getPerson);
router.post('/events/:id_event/groups/:id_group/people', auth.validade, people.addPerson);
router.put('/events/:id_event/groups/:id_group/people/:id', auth.validade, people.updatePerson);
router.delete('/events/:id_event/groups/:id_group/people/:id', auth.validade, people.deletePerson);



export default router;