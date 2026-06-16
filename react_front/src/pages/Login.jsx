import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AuthLayout from "../components/layouts/AuthLayout";
import { Link, useNavigate, useLocation } from "react-router";
import { api } from "../lib/api";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { setAuth } = useAuth();

  async function onSubmit(values) {
    try {
      const { data } = await api.post("/auth/login", values);
      setAuth({
        accessToken: data.accessToken,
        user: {
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          role: data.role || "user",
        },
      });
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Connexion impossible");
    }
  }

  return (
    <AuthLayout>
      <div>
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
          Connexion
        </h1>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          Email et mot de passe
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            id="email"
            placeholder="vous@exemple.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Mot de passe"
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />
          <Button
            text={isSubmitting ? "Connexion…" : "Se connecter"}
            type="submit"
            variant="default"
            size="md"
            disabled={isSubmitting}
          />
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Pas encore de compte ?{" "}
          <Link
            to="/signup"
            className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
          >
            Créer un compte
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
            ← Retour au site
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
