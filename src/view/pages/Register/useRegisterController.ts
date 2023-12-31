import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { authService } from "../../../app/services/authService";
import { SignUpParams } from "../../../app/services/authService/signUp";

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z]).{8,}$/;

const schema = z
  .object({
    name: z.string().nonempty(),
    email: z.string().nonempty().email(),
    password: z
      .string()
      .nonempty()
      .min(8)
      .regex(
        passwordRegex,
        "Password should have 8+ chars, at least 1 uppercase, 1 lowercase, 1 number and 1 special character (!, @, #, $, &, *)",
      ),
    confirmPassword: z.string().nonempty().min(8),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export const useRegisterController = () => {
  const {
    handleSubmit: hookFormHandleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<FormData>({
    mode: "onBlur",
    resolver: zodResolver(schema),
  });

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: async (data: SignUpParams) => {
      return authService.signUp(data);
    },
  });

  const handleSubmit = hookFormHandleSubmit(async (data) => {
    await mutateAsync({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    toast.success("Account created successfully.");
  });

  return {
    handleSubmit,
    register,
    errors,
    isValid,
    isLoading,
  };
};
