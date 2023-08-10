import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SignInParams } from "../../../app/services/authService/signIn";
import { authService } from "../../../app/services/authService";
import { useAuthContext } from "../../../app/hooks/useAuth";

const schema = z.object({
  email: z.string().nonempty().email(),
  password: z.string().nonempty().min(8),
});

type FormData = z.infer<typeof schema>;

export const useLoginController = () => {
  const {
    handleSubmit: hookFormHandleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { signIn } = useAuthContext();

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: async (data: SignInParams) => {
      return authService.signIn(data);
    },
  });

  const handleSubmit = hookFormHandleSubmit(async (data) => {
    const { accessToken } = await mutateAsync(data);
    signIn(accessToken);

    toast.success("Successfully logged in.");
  });

  return { handleSubmit, register, errors, isValid, isLoading };
};
