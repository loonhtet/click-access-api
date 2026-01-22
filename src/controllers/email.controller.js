import sendEmail from "../models/email.model.js";

export const sendEmailController = async (req, res) => {
  try {
    const { to, subject,  variables } = req.body;

    const messageId = await sendEmail({
      to,
      subject,
      template: "email-template.html",
      variables,
    });

    res.status(200).json({
      success: true,
      message: "Email sent using template",
      messageId,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
