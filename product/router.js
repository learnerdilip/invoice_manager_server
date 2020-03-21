const { Router } = require("express");
const Sequelize = require("sequelize");
const Product = require("./model");
const auth = require("../auth/middleWare");
const cron = require("node-cron");
const moment = require("moment");
const MailingList = require("../mailing/model");
const sendMail = require("../sendMail");

const router = new Router();

// scheduler for running something at regular interval
cron.schedule("0 8 * * *", async () => {
  console.log("running a task --------------------------------------------");
  sendMail(
    "diliptalks@gmail.com",
    "Mail sending initiated to expiring warranty users",
    `Sending mails for today: ${new Date()}`
  );
  const MailingListArr = await MailingList.findAll({
    where: {
      remaining_warranty: {
        [Sequelize.Op.lte]: 30
      }
    }
  });
  const shootMail = MailingListArr.map(mailItem => {
    const idtosendon = mailItem.dataValues.email_id;
    sendMail(
      idtosendon,
      "Attention! your appliance warranty is expiring",
      `Your product ID: ${mailItem.dataValues.product_id} is expiring in ${mailItem.dataValues.remaining_warranty} days`
    );
  });
});

router.post("/product", auth, async (request, response, next) => {
  try {
    // console.log("--the PRODUCT form req--", request.body);
    const productCreated = await Product.create({
      document_name: request.body.documentName,
      name_on_invoice: request.body.nameOnInvoice,
      device_name: request.body.deviceName,
      purchase_date: request.body.purchaseDate,
      warranty_start_date: request.body.warrantyStartDate,
      warranty_end_date: request.body.warrantyEndDate,
      warranty_doc_image: request.body.warrantyDocument,
      other_image: request.body.miscellaneousImage,
      roomId: request.body.roomId
    });

    //adding to the mailnig list
    const userEmail = request.user.dataValues.email; //find user email
    const addToMailing = await MailingList.create({
      email_id: userEmail,
      product_id: productCreated.dataValues.id,
      total_warranty: findTotalDays(productCreated),
      remaining_warranty: findRemainingDays(productCreated)
    });

    response.send(productCreated);
  } catch (error) {
    next(console.error);
  }
});

router.get("/products", async (request, response, next) => {
  try {
    const productsArray = await Product.findAll({
      where: { roomId: request.query.roomId }
    });
    response.send(productsArray);
  } catch (error) {
    next(console.error);
  }
});

router.put("/product", async (request, response, next) => {
  try {
    // console.log("the request for edit", request.body);
    const findProd = await Product.findByPk(request.body.id);
    findProd.document_name = request.body.documentName;
    findProd.name_on_invoice = request.body.nameOnInvoice;
    findProd.device_name = request.body.deviceName;
    findProd.purchase_date = request.body.purchaseDate;
    findProd.warranty_start_date = request.body.warrantyStartDate;
    findProd.warranty_end_date = request.body.warrantyEndDate;
    findProd.save();

    // to edit the mailing table also
    const editMailingDetails = await MailingList.findOne({
      where: { product_id: request.body.id }
    });
    // console.log("---edit mailing details----", editMailingDetails);

    request.body.warranty_start_date = findProd.warranty_start_date;
    request.body.warranty_end_date = findProd.warranty_end_date;
    editMailingDetails.total_warranty = findTotalDays({
      dataValues: request.body
    });
    editMailingDetails.remaining_warranty = findRemainingDays({
      dataValues: request.body
    });
    editMailingDetails.save();

    response.send(findProd);
  } catch (error) {
    next(console.error);
  }
});

router.delete("/product", async (request, response, next) => {
  try {
    const productToRemove = await Product.findByPk(request.query.productId);
    const deleteProd = await productToRemove.destroy();
    const ProdMailToRemove = await MailingList.findOne({
      where: { product_id: request.query.productId }
    });
    const deleteMail = await ProdMailToRemove.destroy();

    response.send(productToRemove);
  } catch (error) {
    next(console.error);
  }
});

const findRemainingDays = product => {
  const item = product.dataValues; //the item is a databse type object
  const een = moment(item.warranty_end_date);
  const twee = new Date();
  const duration = moment.duration(een.diff(twee));
  return Math.floor(duration._milliseconds / (3600 * 24 * 1000)); //a item with days remaining property
};

const findTotalDays = product => {
  const item = product.dataValues;
  const een = moment(item.warranty_end_date);
  const twee = moment(item.warranty_start_date);
  const duration = moment.duration(een.diff(twee));
  return Math.floor(duration._milliseconds / (3600 * 24 * 1000));
};

module.exports = router;
