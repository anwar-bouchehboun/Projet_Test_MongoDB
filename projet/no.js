const API_URL = "http://localhost:4000/api";

// Fonction pour charger les données au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  refreshArticleDisplay();
  refreshBlogDisplay();
});

// Gestion des Articles
async function addArticle() {
  const titre = document.getElementById("articleTitle").value;
  const contenu = document.getElementById("articleContent").value;

  try {
    console.log("Création d'un nouvel article:", { titre, contenu });
    const response = await axios.post(`${API_URL}/articles`, {
      titre,
      contenu,
    });
    console.log("Article créé:", response.data);

    // Vérifier que l'article a bien un ID
    if (!response.data._id) {
      throw new Error("L'article créé n'a pas d'ID");
    }

    document.getElementById("articleTitle").value = "";
    document.getElementById("articleContent").value = "";
    await refreshArticleDisplay();
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'article:", error);
    alert(`Erreur lors de l'ajout de l'article: ${error.message}`);
  }
}

async function refreshArticleDisplay() {
  try {
    const response = await axios.get(`${API_URL}/articles`);
    const articleDisplay = document.getElementById("articleDisplay");
    console.log("Articles reçus:", response.data);

    if (response.data.length === 0) {
      articleDisplay.innerHTML = "<p>Aucun article disponible</p>";
      return;
    }

    // Utiliser un tableau intermédiaire pour éviter les problèmes d'échappement
    const articlesHtml = [];
    for (const article of response.data) {
      const id = article._id;
      // Vérifier que l'ID est complet
      console.log("ID de l'article:", id);

      const articleHtml = `
      <div class="article" data-id="${id}">
        <h3>${article.titre}</h3>
        <p class="value">${article.contenu}</p>
        <div class="article-actions">
          <button onclick="editArticle('${id}')">       
            <i class="fas fa-edit"></i> 
          </button>
          <button onclick="deleteArticle('${id}')">        
            <i class="fas fa-trash"></i> 
          </button>
        </div>
      </div>
      `;
      articlesHtml.push(articleHtml);
    }

    articleDisplay.innerHTML = articlesHtml.join("");
  } catch (error) {
    console.log("Erreur lors du chargement des articles:");
    articleDisplay.innerHTML = "<p>Erreur lors du chargement des articles</p>";
  }
}

// Gestion des Blogs
async function addBlog() {
  const titre = document.getElementById("blogTitle").value;
  const contenu = document.getElementById("blogContent").value;

  try {
    const response = await axios.post(`${API_URL}/blogs`, {
      titre,
      contenu,
    });
    console.log("Blog ajouté:", response.data);
    // Vider les champs du formulaire
    document.getElementById("blogTitle").value = "";
    document.getElementById("blogContent").value = "";
    // Rafraîchir l'affichage
    refreshBlogDisplay();
  } catch (error) {
    console.log("Erreur lors de l'ajout du blog:");
  }
}

async function refreshBlogDisplay() {
  try {
    const response = await axios.get(`${API_URL}/blogs`);
    const blogDisplay = document.getElementById("blogDisplay");

    if (response.data.length === 0) {
      blogDisplay.innerHTML = "<p>Aucun blog disponible</p>";
      return;
    }

    blogDisplay.innerHTML = response.data
      .map(
        (blog) => `
          <div class="blog" data-id="${blog._id}">
            <h3>${blog.titre}</h3>
            <p>${blog.contenu}</p>
            <div class="blog-footer">
              <div class="blog-actions">
                <button onclick="editBlog('${blog._id}')">Éditer</button>
                <button onclick="deleteBlog('${blog._id}')">Supprimer</button>
              </div>
            </div>
          </div>
        `
      )
      .join("");
  } catch (error) {
    console.log("Erreur lors du chargement des blogs:");
  }
}

// Fonctions pour les Articles
async function editArticle(id) {
  if (!id) {
    console.log("ID manquant");
    alert("Erreur: ID de l'article manquant");
    return;
  }

  console.log("ID complet reçu pour édition:", id);
  try {
    // Construire l'URL avec l'ID complet
    const url = `${API_URL}/articles/${id}`;
    console.log("URL complète de la requête:", url);

    const response = await axios.get(url);
    console.log("Réponse du serveur:", response.data);

    const article = response.data;
    if (!article) {
      alert("Article non trouvé");
      return;
    }

    // Remplir le formulaire
    document.getElementById("articleTitle").value = article.titre;
    document.getElementById("articleContent").value = article.contenu;

    // Stocker l'ID complet
    document.getElementById("addArticleBtn").style.display = "none";
    document.getElementById("modifyArticleBtn").style.display = "block";
    document.getElementById("modifyArticleBtn").setAttribute("data-id", id);
  } catch (error) {
    console.error("Erreur détaillée:", error);
    if (error.response && error.response.status === 404) {
      alert("Article non trouvé dans la base de données");
    } else {
      alert(`Erreur lors de la récupération de l'article: ${error.message}`);
    }
  }
}

async function modifyArticle() {
  const id = document
    .getElementById("modifyArticleBtn")
    .getAttribute("data-id");
  const titre = document.getElementById("articleTitle").value;
  const contenu = document.getElementById("articleContent").value;

  try {
    await axios.put(`${API_URL}/articles/${id}`, {
      titre,
      contenu,
    });

    document.getElementById("articleTitle").value = "";
    document.getElementById("articleContent").value = "";
    document.getElementById("addArticleBtn").style.display = "block";
    document.getElementById("modifyArticleBtn").style.display = "none";

    refreshArticleDisplay();
  } catch (error) {
    console.error("Erreur lors de la modification de l'article:", error);
    alert("Erreur lors de la modification de l'article");
  }
}

async function deleteArticle(id) {
  if (!id) {
    console.error("ID manquant");
    alert("Erreur: ID de l'article manquant");
    return;
  }

  console.log("ID complet pour la suppression:", id);
  if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
    try {
      const url = `${API_URL}/articles/${id}`;
      console.log("URL complète de suppression:", url);

      const response = await axios.delete(url);
      console.log("Réponse de suppression:", response.data);

      await refreshArticleDisplay();
    } catch (error) {
      console.error("Erreur détaillée:", error);
      if (error.response && error.response.status === 404) {
        alert("Article non trouvé dans la base de données");
      } else {
        alert("Erreur lors de la suppression de l'article");
      }
    }
  }
}

// Fonctions pour les Blogs
async function editBlog(id) {
  try {
    const response = await axios.get(`${API_URL}/blogs/${id}`);
    const blog = response.data;

    // Remplir le formulaire avec les données du blog
    document.getElementById("blogTitle").value = blog.titre;
    document.getElementById("blogContent").value = blog.contenu;

    // Stocker l'ID du blog en cours d'édition
    document.querySelector("#blogs button:nth-child(1)").style.display = "none";
    document.querySelector("#blogs button:nth-child(2)").style.display =
      "block";
    document
      .querySelector("#blogs button:nth-child(2)")
      .setAttribute("data-id", id);
  } catch (error) {
    console.error("Erreur lors de la récupération du blog:", error);
  }
}

async function modifyBlog() {
  const id = document
    .querySelector("#blogs button:nth-child(2)")
    .getAttribute("data-id");
  const titre = document.getElementById("blogTitle").value;
  const contenu = document.getElementById("blogContent").value;

  try {
    await axios.put(`${API_URL}/blogs/${id}`, {
      titre,
      contenu,
    });

    // Réinitialiser le formulaire
    document.getElementById("blogTitle").value = "";
    document.getElementById("blogContent").value = "";
    document.querySelector("#blogs button:nth-child(1)").style.display =
      "block";
    document.querySelector("#blogs button:nth-child(2)").style.display = "none";

    // Rafraîchir l'affichage
    refreshBlogDisplay();
  } catch (error) {
    console.error("Erreur lors de la modification du blog:", error);
  }
}

async function deleteBlog(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce blog ?")) {
    try {
      await axios.delete(`${API_URL}/blogs/${id}`);
      refreshBlogDisplay();
    } catch (error) {
      console.error("Erreur lors de la suppression du blog:", error);
    }
  }
}
