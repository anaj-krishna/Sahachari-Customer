import { TextInput, TextInputProps } from "react-native";

export type AuthInputProps = TextInputProps;

export function AuthInput(props: AuthInputProps) {
  return (
    <TextInput
      className="border border-gray-300 rounded-md px-4 py-3 mb-3"
      {...props}
    />
  );
}
