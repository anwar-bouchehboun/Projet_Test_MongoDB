const mongoose = require("mongoose");

// Schéma pour les Articles
const articleSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
  },
  contenu: {
    type: String,
    required: true,
  }
});

// Schéma pour les Blogs
const blogSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
  },
  contenu: {
    type: String,
    required: true,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
  },
  categorie: {
    type: String,
    default: "Non catégorisé",
  },
  auteur: {
    type: String,
    default: "Anonyme",
  },
});

const Article = mongoose.model("Article", articleSchema);
const Blog = mongoose.model("Blog", blogSchema);

module.exports = { Article, Blog };
