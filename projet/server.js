const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Article, Blog } = require("./models");

const app = express();

// Configuration middleware
app.use(cors());
app.use(express.json());

// Connexion MongoDB avec gestion d'erreur et debug
mongoose
  .connect("mongodb://localhost:27017/gestion_contenus", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion MongoDB:", err));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Au début du fichier, après les requires
mongoose.connection.on("connected", async () => {
  console.log("MongoDB connecté");
  try {
    // Vérifier les articles existants
    const articles = await Article.find();
    console.log("Articles dans la base de données:", articles);
  } catch (error) {
    console.error("Erreur lors de la vérification des articles:", error);
  }
});

// Routes pour les Articles
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    console.log("Articles trouvés:", articles);
    res.json(articles);
  } catch (error) {
    console.error("Erreur lors de la récupération des articles:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/articles", async (req, res) => {
  try {
    const article = new Article(req.body);
    console.log("Nouvel article à créer:", article);
    await article.save();
    console.log("Article créé:", article);
    res.status(201).json(article);
  } catch (error) {
    console.error("Erreur lors de la création de l'article:", error);
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID reçu:", id);



    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("ID invalide");
      return res.status(400).json({ message: "ID d'article invalide" });
    }

    // Rechercher l'article avec plus de détails
    console.log("Recherche de l'article avec l'ID:", id);
    const article = await Article.findById(id);
    console.log("Résultat de la recherche:", article);

    if (!article) {
      console.log("Article non trouvé");
      return res.status(404).json({ message: "Article non trouvé" });
    }

    console.log("Article trouvé et envoyé:", article);
    res.json(article);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

app.put("/api/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Modification de l'article:", id, req.body);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID d'article invalide" });
    }

    const article = await Article.findByIdAndUpdate(
      id,
      { titre: req.body.titre, contenu: req.body.contenu },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ message: "Article non trouvé" });
    }
    console.log("Article modifié:", article);
    res.json(article);
  } catch (error) {
    console.error("Erreur lors de la modification:", error);
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Tentative de suppression de l'article avec ID:", id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("ID invalide:", id);
      return res.status(400).json({ message: "ID d'article invalide" });
    }

    console.log("Recherche de l'article à supprimer...");
    const article = await Article.findById(id);

    if (!article) {
      console.log("Article non trouvé pour la suppression");
      return res.status(404).json({ message: "Article non trouvé" });
    }

    console.log("Article trouvé, suppression...");
    await Article.findByIdAndDelete(id);

    console.log("Article supprimé avec succès");
    res.json({
      message: "Article supprimé avec succès",
      deletedArticle: article,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    res.status(500).json({ message: error.message });
  }
});

// Routes pour les Blogs
app.get("/api/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/blogs", async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { titre: req.body.titre, contenu: req.body.contenu },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog non trouvé" });
    }
    res.json({ message: "Blog supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route de débogage pour vérifier tous les articles
app.get("/api/debug/articles", async (req, res) => {
  try {
    const articles = await Article.find();
    console.log("Tous les articles:", articles);
    res.json({
      count: articles.length,
      articles: articles,
    });
  } catch (error) {
    console.error("Erreur de débogage:", error);
    res.status(500).json({ error: error.message });
  }
});

// Route de débogage pour vérifier un article spécifique
app.get("/api/debug/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Vérification de l'ID:", id);
    console.log(
      "Est-ce un ID MongoDB valide?",
      mongoose.Types.ObjectId.isValid(id)
    );

    // Essayer différentes méthodes de recherche
    const articleById = await Article.findById(id);
    const articleByQuery = await Article.findOne({ _id: id });

    res.json({
      idChecked: id,
      isValidObjectId: mongoose.Types.ObjectId.isValid(id),
      articleById,
      articleByQuery,
    });
  } catch (error) {
    console.error("Erreur de débogage article spécifique:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
