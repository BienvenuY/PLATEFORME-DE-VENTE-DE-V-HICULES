import { useState } from "react";
import AuthLayout from "../components/layouts/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmepassword: "",
  });

  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmepassword: "",
  });

  const [serverErrors, setServerErrors] = useState("");

  function validateForm() {
    const newErrors = {};
    if (!formData.firstname.trim()) {
      newErrors.firstname = "Prénom requis";
    }
    if (!formData.lastname.trim()) {
      newErrors.lastname = "Nom requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Mot de passe requis";
    }

    if (!formData.confirmepassword.trim()) {
      newErrors.confirmepassword = "Confirmation requise";
    }

    if (
      formData.password &&
      formData.confirmepassword &&
      formData.password !== formData.confirmepassword
    ) {
      newErrors.confirmepassword = "Les mots de passe ne correspondent pas";
    }

    return newErrors;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setServerErrors("");

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors({
        firstname: validationErrors.firstname || "",
        lastname: validationErrors.lastname || "",
        email: validationErrors.email || "",
        password: validationErrors.password || "",
        confirmepassword: validationErrors.confirmepassword || "",
      });
      return;
    }

    try {
      await api.post("/auth/register", {
        first_name: formData.firstname,
        last_name: formData.lastname,
        email: formData.email,
        password: formData.password,
      });
      navigate("/login");
    } catch (error) {
      const data = error.response?.data;
      const fromApi =
        typeof data === "object" && data != null && "message" in data
          ? String(data.message)
          : typeof data === "string"
            ? data
            : "";
      const detail =
        fromApi ||
        error.message ||
        "Impossible de joindre le serveur. Lancez le backend (port 5000), vérifiez VITE_API_URL dans .env du front, et que MongoDB répond.";
      setServerErrors(detail);
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
          Créer un compte
        </h1>

        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Complétez les champs pour vous inscrire
        </p>
        {serverErrors && (
          <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            {serverErrors}
          </p>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Prénom"
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Prénom"
            value={formData.firstname}
            onChange={handleChange}
            error={errors.firstname}
          />
          <Input
            label="Nom"
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Nom"
            value={formData.lastname}
            onChange={handleChange}
            error={errors.lastname}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            id="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          <Input
            label="Confirmer le mot de passe"
            type="password"
            name="confirmepassword"
            id="confirmepassword"
            placeholder="Confirmer"
            value={formData.confirmepassword}
            onChange={handleChange}
            error={errors.confirmepassword}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              text="Créer le compte"
              type="submit"
              variant="default"
              size="md"
            />
            <Button
              text="Retour"
              type="button"
              variant="outlined"
              size="sm"
              onClick={() => navigate(-1)}
            />
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignUp;
