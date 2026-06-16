const mongoose = require("mongoose");

/**
 * Retire guillemets autour d'une valeur .env.
 */
function stripQuotes(s) {
  if (!s) return "";
  const t = String(s).trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

/**
 * Construit l’URI si vous préférez des variables séparées (mot de passe avec @ # etc. sans encoder à la main).
 * Sinon : DATABASE_URI ou MONGODB_URI (une seule ligne complète).
 */
function resolveMongoUri() {
  const direct =
    stripQuotes(process.env.DATABASE_URI) ||
    stripQuotes(process.env.MONGODB_URI) ||
    "";

  if (direct) {
    let u = direct;
    if (!u.includes("retryWrites=")) {
      u += u.includes("?") ? "&retryWrites=true&w=majority" : "?retryWrites=true&w=majority";
    }
    return u;
  }

  const user = stripQuotes(process.env.MONGO_USER);
  const pass =
    process.env.MONGO_PASSWORD != null ? String(process.env.MONGO_PASSWORD) : "";
  const cluster =
    stripQuotes(process.env.MONGO_CLUSTER) || "cluster0.oo1e3xj.mongodb.net";
  const dbname = stripQuotes(process.env.MONGO_DBNAME) || "database_tp";

  if (user && pass) {
    const encU = encodeURIComponent(user);
    const encP = encodeURIComponent(pass);
    return `mongodb+srv://${encU}:${encP}@${cluster}/${dbname}?retryWrites=true&w=majority&appName=Cluster0`;
  }

  return "";
}

/**
 * Chaîne de connexion : DATABASE_URI / MONGODB_URI, ou MONGO_USER + MONGO_PASSWORD + MONGO_CLUSTER + MONGO_DBNAME.
 * Atlas : Network Access → IP autorisée ; mot de passe avec caractères spéciaux → préférez MONGO_PASSWORD.
 */
const connectDB = async () => {
  const uri = resolveMongoUri();

  if (!uri) {
    console.error(
      "\n❌ MongoDB : aucune URI trouvée.\n" +
        "   Option A — une ligne dans .env :\n" +
        "   DATABASE_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/maBase?retryWrites=true&w=majority\n" +
        "   Option B — variables séparées (recommandé si le mot de passe contient @ # etc.) :\n" +
        "   MONGO_USER=...\n" +
        "   MONGO_PASSWORD=...\n" +
        "   MONGO_CLUSTER=cluster0.xxxxx.mongodb.net\n" +
        "   MONGO_DBNAME=maBase\n"
    );
    return;
  }

  mongoose.set("strictQuery", true);
  mongoose.set("bufferTimeoutMS", 8000);

  const forceIpv4 =
    process.env.MONGODB_FORCE_IPV4 !== "0" &&
    process.env.MONGODB_FORCE_IPV4 !== "false";

  const tlsInsecure = process.env.MONGODB_TLS_INSECURE === "true";
  if (tlsInsecure) {
    console.warn(
      "\n⚠️  MONGODB_TLS_INSECURE=true — vérification TLS désactivée (dépannage uniquement, jamais en production).\n"
    );
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 45_000,
      socketTimeoutMS: 45_000,
      ...(forceIpv4 ? { family: 4 } : {}),
      ...(tlsInsecure ? { tlsAllowInvalidCertificates: true } : {}),
    });
    const host = mongoose.connection.host || "?";
    console.log(`✅ MongoDB connecté (${host})`);
  } catch (err) {
    const msg = String(err.message || err);
    console.error("\n❌ MongoDB : échec de connexion.");
    console.error("   Message :", msg);
    console.error(
      "\n   ► Atlas → Security → Network Access : ajoutez votre IP ou 0.0.0.0/0 (test).\n" +
        "   ► Vérifiez USER / PASSWORD / nom de base dans DATABASE_URI ou MONGO_*.\n" +
        "   ► Erreur « tlsv1 alert internal » (SSL 80) : souvent antivirus (Kaspersky, etc.) qui scanne le SSL,\n" +
        "      ou VPN / proxy. Essayez : désactiver temporairement l’inspection HTTPS, couper le VPN,\n" +
        "      ou dans .env (test seulement) : MONGODB_TLS_INSECURE=true\n" +
        "   ► Essayez aussi : MONGODB_FORCE_IPV4=0 (si IPv4 posait problème sur votre réseau).\n" +
        "   ► Chaîne « standard » (sans srv) : Atlas → Connect → Drivers → afficher autre format de chaîne.\n"
    );
    if (msg.includes("alert internal") || msg.includes("SSL alert")) {
      console.error(
        "   [Détail SSL] Le serveur Atlas coupe la poignée de main TLS. Ce n’est presque jamais un bug du code Node.\n"
      );
    }
  }
};

module.exports = connectDB;