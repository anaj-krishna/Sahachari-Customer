import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

interface EditProfileModalProps {
  visible: boolean;
  field: "name" | "mobileNumber" | "address" | "address2" | "serviceablePincodes" | null;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isPending?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  name: "Full Name",
  mobileNumber: "Mobile Number",
  address: "Primary Address",
  address2: "Secondary Address",
  serviceablePincodes: "Serviceable Pincodes",
};

export function EditProfileModal({
  visible,
  field,
  value,
  onChange,
  onClose,
  onSave,
  isPending = false,
}: EditProfileModalProps) {
  const getFieldLabel = () => (field ? FIELD_LABELS[field] : "");
  const isMultiline = field === "address" || field === "address2";
  const keyboardType = field === "mobileNumber" ? "phone-pad" : "default";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="bg-white rounded-t-3xl"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <Text className="text-2xl font-bold text-gray-900">
              Edit {getFieldLabel()}
            </Text>
            <Pressable
              onPress={onClose}
              className="bg-gray-100 rounded-full p-2"
            >
              <X size={20} color="#1F2937" strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Input Field */}
          <View className="p-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              {getFieldLabel()}
            </Text>
            
            <TextInput
              value={value}
              onChangeText={onChange}
              placeholder={`Enter ${getFieldLabel().toLowerCase()}`}
              placeholderTextColor="#9CA3AF"
              multiline={isMultiline}
              numberOfLines={isMultiline ? 3 : 1}
              keyboardType={keyboardType}
              editable={!isPending}
              className={`bg-gray-50 rounded-2xl px-4 border border-gray-200 text-base text-gray-900 ${
                isMultiline ? "py-4 min-h-[100px]" : "py-4"
              }`}
              style={isMultiline ? { textAlignVertical: "top" } : undefined}
            />

            {field === "serviceablePincodes" && (
              <Text className="text-xs text-gray-500 mt-2">
                Enter comma-separated pincodes (e.g., 400001, 400050)
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="p-6 gap-3">
            <Pressable
              onPress={onSave}
              disabled={isPending}
              className={`rounded-2xl overflow-hidden ${
                isPending ? "opacity-50" : ""
              }`}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-bold text-lg">
                    Save Changes
                  </Text>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable
              onPress={onClose}
              disabled={isPending}
              className="bg-gray-100 py-4 rounded-2xl"
            >
              <Text className="text-center text-gray-700 font-semibold text-base">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}