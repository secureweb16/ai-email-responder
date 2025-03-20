const express = require("express");
const Router = express.Router();
const emailController = require("../controllers/email.controller");
const moboxController = require("../controllers/mbox.controller");

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Get a response from OpenAI's ChatGPT
 *     description: Sends a message and receives a ChatGPT-generated response.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: "Tell me a joke"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "Why don't scientists trust atoms? Because they make up everything!"
 *       400:
 *         description: Bad request - missing message
 *       500:
 *         description: Internal server error
 */
Router.post("/chat", emailController.chat);

/**
 * @swagger
 * /get-emails:
 *   post:
 *     summary: Get Emails
 *     description: Get all the emails data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "anmol.secureweb@gmail.com"
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request - missing message
 *       500:
 *         description: Internal server error
 */
Router.post("/get-emails", emailController.fetchEmails);


/**
 * @swagger
 * /get-mbox:
 *   get:
 *     summary: Get Mbox Emails
 *     description: Get all the emails data
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Bad request - missing message
 *       500:
 *         description: Internal server error
 */
Router.get("/get-mbox", moboxController.getMessages);

module.exports = Router;