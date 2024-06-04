const mongoose = require("mongoose");
const userProfile = require("../models/userProfile");

const currentWarningsController = function (currentWarnings) {
  const checkIfSpecialCharacter = (warning) => {
    return !/^\b[a-zA-Z]+\b.*$/.test(warning);
  };
  const getCurrentWarnings = async (req, res) => {
    try {
      const response = await currentWarnings.find({});

      if (response.length === 0) {
        return res.status(400).send({ message: "no valid records" });
      }
      return res.status(201).send({ currentWarningDescriptions: response });
    } catch (error) {
      res.status(401).send({ message: error.message || error });
    }
  };

  const postNewWarningDescription = async (req, res) => {
    try {
      const { newWarning, activeWarning } = req.body;

      const newWarningLowerCase = newWarning
        .split(" ")
        .map((warning) => {
          if (!/^\b[a-zA-Z]+\b.*$/.test(warning)) {
            throw new Error(
              "warning cannot have special characters as the first letter",
            );
          }
          return warning.toLowerCase();
        })
        .join(" ");

      const warnings = await currentWarnings.find({});

      if (warnings.length === 0) {
        return res.status(400).send({ message: "no valid records" });
      }

      //check to see if it is deactivated or not
      //deactaivted warnings should count and duplicates cannot be created
      const duplicateFound = warnings.some(
        (warning) => warning.warningTitle.toLowerCase() === newWarningLowerCase,
      );
      if (duplicateFound) {
        return res.status(422).send({ error: "warning already exists" });
      }
      const newWarningDescription = new currentWarnings();
      newWarningDescription.warningTitle = newWarning;
      newWarningDescription.activeWarning = activeWarning;

      warnings.push(newWarningDescription);
      await newWarningDescription.save();

      return res.status(201).send({ newWarnings: warnings });
    } catch (error) {
      return res.status(401).send({ message: error.message });
    }
  };

  const editWarningDescription = async (req, res) => {
    try {
      const { editedWarning } = req.body;

      const id = editedWarning._id;

      if (checkIfSpecialCharacter(editedWarning.warningTitle)) {
        return res.status(422).send({
          error: "warning cannot have special characters as the first letter",
        });
      }
      console.log(" log", checkIfSpecialCharacter(editedWarning.warningTitle));

      const response = await currentWarnings.findOneAndUpdate(
        { _id: id },
        [{ $set: { warningTitle: editedWarning.warningTitle.trim() } }],
        { new: true },
      );

      res.status(201).send({ message: "warning description was updated" });
    } catch (error) {
      res.status(401).send({ message: error.message || error });
    }
  };
  const updateWarningDescription = async (req, res) => {
    try {
      const { warningDescriptionId } = req.params;

      await currentWarnings.findOneAndUpdate(
        { _id: warningDescriptionId },
        [{ $set: { activeWarning: { $not: "$activeWarning" } } }],
        { new: true },
      );

      res.status(201).send({ message: "warning description was updated" });
    } catch (error) {
      res.status(401).send({ message: error.message || error });
    }
  };

  const deleteWarningDescription = async (req, res) => {
    try {
      const { warningDescriptionId } = req.params;
      const documentToDelete =
        await currentWarnings.findById(warningDescriptionId);

      await currentWarnings.deleteOne({
        _id: mongoose.Types.ObjectId(warningDescriptionId),
      });

      const deletedDescription = documentToDelete.warningTitle;

      await userProfile.updateMany(
        {
          "warnings.description": deletedDescription,
        },
        {
          $pull: {
            warnings: { description: deletedDescription },
          },
        },
      );

      res.status(200).send({
        message:
          "warning description was successfully deleted and user profiles updated",
      });
    } catch (error) {
      res.status(401).send({ message: error.message || error });
    }
  };

  return {
    getCurrentWarnings,
    postNewWarningDescription,
    updateWarningDescription,
    deleteWarningDescription,
    editWarningDescription,
  };
};
module.exports = currentWarningsController;