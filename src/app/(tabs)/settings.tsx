import React from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Camera, Mail, Phone, MapPin, ChevronRight, LogOut } from "lucide-react-native";
import { useAuthStore } from "../../store/auth.store";
import { useProfile } from "../../hooks/useProfile";
import { EditProfileModal } from "../../components/settings/EditProfileModal";

export default function Settings() {
  const logout = useAuthStore((s) => s.logout);
  const { 
    profile, isLoading, showEditModal, editField, editValue, 
    setEditValue, isUpdating, openEditModal, closeEditModal, handleSave 
  } = useProfile();

  if (isLoading) return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#1877F2" />
    </View>
  );

  const SettingItem = ({ icon: Icon, label, value, field }: any) => (
    <Pressable 
      onPress={() => field && openEditModal(field, value)}
      className="flex-row items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
          <Icon size={20} color="#1877F2" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-1">{label}</Text>
          <Text className="text-gray-800 font-semibold text-base" numberOfLines={1}>{value || "Not set"}</Text>
        </View>
      </View>
      {field && <ChevronRight size={18} color="#9CA3AF" />}
    </Pressable>
  );

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="bg-white px-6 py-6 border-b border-gray-200">
          <Text className="text-3xl font-bold text-gray-800">Settings</Text>
        </View>

        <View className="bg-white mx-4 mt-6 rounded-2xl shadow-sm overflow-hidden">
          <View className="bg-blue-600 px-6 py-8 items-center">
            <View className="relative">
              {profile?.image ? (
                <Image source={{ uri: profile.image }} className="w-24 h-24 rounded-full border-4 border-white" />
              ) : (
                <View className="w-24 h-24 rounded-full bg-white items-center justify-center border-4 border-white">
                  <User size={40} color="#1877F2" />
                </View>
              )}
              <Pressable className="absolute bottom-0 right-0 bg-blue-700 rounded-full p-2 border-2 border-white">
                <Camera size={16} color="white" />
              </Pressable>
            </View>
            <Text className="text-white font-bold text-2xl mt-4">{profile?.name || "User"}</Text>
          </View>

          <View className="p-4">
            <SettingItem icon={User} label="Full Name" value={profile?.name} field="name" />
            <SettingItem icon={Mail} label="Email" value={profile?.email} />
            <SettingItem icon={Phone} label="Mobile" value={profile?.mobileNumber} field="mobileNumber" />
            <SettingItem icon={MapPin} label="Primary Address" value={profile?.address} field="address" />
            <SettingItem icon={MapPin} label="Secondary Address" value={profile?.address2} field="address2" />
          </View>
        </View>

        <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm">
          <Pressable onPress={logout} className="flex-row items-center p-4 active:bg-red-50">
            <LogOut size={20} color="#EF4444" />
            <Text className="text-red-600 font-semibold ml-3">Logout</Text>
          </Pressable>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        field={editField}
        value={editValue}
        onChange={setEditValue}
        onClose={closeEditModal}
        onSave={handleSave}
        isPending={isUpdating}
      />
    </SafeAreaView>
  );
}