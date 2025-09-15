import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { groupsSubApi } from "../api/groups-sub-api";
import { CreateGroupSub, GroupSub } from "../types/groups-sub.dto";

export const useGetGroupsSub = (enabled: boolean = true) => {
  return useQuery<GroupSub[]>({
    queryKey: ["groups-sub"],
    queryFn: groupsSubApi.getGroupsSub,
    placeholderData: [],
    enabled,
  });
};

export const useCreateGroupSub = () => {
  const queryClient = useQueryClient();

  return useMutation<GroupSub, Error, CreateGroupSub>({
    mutationFn: groupsSubApi.createGroupSub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups-sub"] });
      toast.success("Подгруппа успешно создана");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при создании подгруппы");
    },
  });
};

export const useUpdateGroupSub = () => {
  const queryClient = useQueryClient();

  return useMutation<GroupSub, Error, { id: number; groupSub: CreateGroupSub }>(
    {
      mutationFn: ({ id, groupSub }) =>
        groupsSubApi.updateGroupSub(id, groupSub),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["groups-sub"] });
        toast.success("Подгруппа успешно обновлена");
      },
      onError: (error) => {
        toast.error(error.message || "Ошибка при обновлении подгруппы");
      },
    }
  );
};

export const useDeleteGroupSub = () => {
  const queryClient = useQueryClient();

  return useMutation<GroupSub, Error, number>({
    mutationFn: groupsSubApi.deleteGroupSub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups-sub"] });
      toast.success("Подгруппа успешно удалена");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при удалении подгруппы");
    },
  });
};
