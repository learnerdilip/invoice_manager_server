const { Router } = require("express");
const Room = require("./model");
const auth = require("../auth/middleWare");
const MailingList = require("../mailing/model");
const Product = require("../product/model");

const router = new Router();

router.post("/room", auth, async (request, response, next) => {
  try {
    const createdRoom = await Room.create({
      room_name: request.body.roomName,
      userId: request.user.id
    });
    response.send(createdRoom);
  } catch {
    error => next(error);
  }
});

router.get("/rooms", auth, async (request, response, next) => {
  try {
    const fetchedRooms = await Room.findAll({
      where: { userId: request.user.id }
    });
    //add the products close to expiry here
    const prodIdList = await MailingList.findAll({
      where: { email_id: request.user.email }
    });
    const productIdArr = await prodIdList
      .filter(item => item.dataValues.remaining_warranty <= 30)
      .map(item => {
        return {
          productID: item.dataValues.product_id,
          warrantyLeft: item.dataValues.remaining_warranty
        };
      });

    const deviceNameArr = productIdArr.map(async item => {
      const prodItem = await Product.findByPk(item.productID);
      item.deviceName = prodItem.device_name;
      // console.log("--the newItem NOW -----------", item);
      return item;
    });

    Promise.all(deviceNameArr).then(async () => {
      // console.log("deviceNameArr--------------------", deviceNameArr);
      let newFetchRoomItem = {
        roomsList: [...fetchedRooms],
        expiringProductId: productIdArr
      };
      response.send(newFetchRoomItem);
    });
  } catch {
    error => next(error);
  }
});

module.exports = router;
