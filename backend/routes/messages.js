const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/',               protect, ctrl.sendMessage);
router.get('/inbox',           protect, ctrl.getInbox);
router.get('/sent',            protect, ctrl.getSent);
router.get('/unread-count',    protect, ctrl.getUnreadCount);
router.get('/employees',       protect, ctrl.getEmployees);
router.get('/:id',             protect, ctrl.getMessage);
router.delete('/:id',          protect, ctrl.deleteMessage);

module.exports = router;
