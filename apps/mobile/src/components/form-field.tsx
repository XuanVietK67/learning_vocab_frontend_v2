import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { tokens } from "@repo/shared";

interface FormFieldProps<T extends FieldValues>
  extends Omit<TextInputProps, "value" | "onChangeText" | "onBlur"> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={(value as string) ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholderTextColor={tokens.color.ink3}
            {...inputProps}
          />
        )}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: tokens.color.ink2 },
  input: {
    borderWidth: 1,
    borderColor: "#d7ddda",
    borderRadius: tokens.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: tokens.color.ink,
    backgroundColor: "#ffffff",
  },
  inputError: { borderColor: tokens.color.bad },
  errorText: { fontSize: 13, color: tokens.color.bad },
});
