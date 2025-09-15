import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { groupsApi } from "../api/groups-api";
import { CreateGroup, Group, UpdateGroup } from "../types/group.dto";

export const useGetGroups = (enabled: boolean = true) => {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: groupsApi.getGroups,
    placeholderData: [],
    enabled,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, CreateGroup>({
    mutationFn: groupsApi.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Группа успешно создана");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при создании группы");
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, { id: number; group: UpdateGroup }>({
    mutationFn: ({ id, group }) => groupsApi.updateGroup(id, group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Группа успешно обновлена");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при обновлении группы");
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, number>({
    mutationFn: groupsApi.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success("Группа успешно удалена");
    },
  });
};
