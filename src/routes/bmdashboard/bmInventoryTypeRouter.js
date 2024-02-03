const express = require('express');

const routes = function (baseInvType, matType, consType, reusType, toolType, equipType) {
  const inventoryTypeRouter = express.Router();
  const controller = require('../../controllers/bmdashboard/bmInventoryTypeController')(baseInvType, matType, consType, reusType, toolType, equipType);

  // Route for fetching all material types
  inventoryTypeRouter.route('/invtypes/materials')
    .get(controller.fetchMaterialTypes);

  inventoryTypeRouter.route('/invtypes/material')
    .post(controller.addMaterialType);
  // Route for fetching types by selected type
  inventoryTypeRouter.route('/invtypes/:type')
    .get(controller.fetchInventoryByType);

  inventoryTypeRouter.route('/invtypes/equipment')
    .post(controller.addEquipmentType);

  // Combined routes for getting a single inventory type and updating its name and unit of measurement
  inventoryTypeRouter.route('/invtypes/material/:invtypeId')
    .get(controller.fetchSingleInventoryType);
    // .put(controller.updateNameAndUnit);

  inventoryTypeRouter.route('/inventoryUnits')
    .get(controller.fetchInvUnitsFromJson)
    .post(controller.addInvUnit)
    .delete(controller.deleteInvUnit);

  // update or delete an inventory type in any category
  inventoryTypeRouter.route('/invtypes/:type/:invtypeId')
    .put(controller.updateSingleInvType)
    .delete(controller.deleteSingleInvType);

  return inventoryTypeRouter;
};

module.exports = routes;
