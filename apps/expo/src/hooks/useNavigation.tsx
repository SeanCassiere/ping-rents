import { useNavigation, type NavigationProp } from "@react-navigation/native";

export const useCustomNavigation = () => useNavigation<NavigationProp<any>>();
