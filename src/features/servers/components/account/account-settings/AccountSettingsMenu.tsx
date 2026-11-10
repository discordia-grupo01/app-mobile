import {
  BILLING_COPY,
  type BillingSection,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";

import { Feather } from "@expo/vector-icons";
import { useState, type ReactNode } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

import { withAlpha } from "../../../../../lib/color";
import { useThemeColors } from "../../../../../theme/theme-context";
import { BILLING_MENU_ITEMS } from "../../../../billing/components/navigation/billingMenuItems";

interface SettingsRowProps {
  icon: ReactNode;
  iconBackground: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  /** Las filas de Facturación se ponen amarillas al tocarlas, como el ítem activo de web. */
  premiumHighlight?: boolean;
}

function SettingsRow({
  icon,
  iconBackground,
  title,
  subtitle,
  onPress,
  premiumHighlight = false,
}: SettingsRowProps) {
  const colors = useThemeColors();
  const [isPressed, setIsPressed] = useState(false);
  const isHighlighted = premiumHighlight && isPressed;

  return (
    <Pressable
      className="mb-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
      style={
        isHighlighted
          ? {
              backgroundColor: PREMIUM_BRAND_COLORS.yellow,
              borderColor: PREMIUM_BRAND_COLORS.yellow,
            }
          : isPressed
            ? { opacity: 0.75 }
            : undefined
      }
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      accessibilityRole="button"
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: isHighlighted
            ? PREMIUM_BRAND_COLORS.deep
            : iconBackground,
        }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className="mb-0.5 text-[16px] font-bold text-content"
          style={
            isHighlighted ? { color: PREMIUM_BRAND_COLORS.deep } : undefined
          }
        >
          {title}
        </Text>
        <Text
          className="text-[13px] text-content-subtle"
          style={
            isHighlighted ? { color: PREMIUM_BRAND_COLORS.deep } : undefined
          }
        >
          {subtitle}
        </Text>
      </View>
      <Feather
        name="chevron-right"
        size={18}
        color={isHighlighted ? PREMIUM_BRAND_COLORS.deep : colors.textSubtle}
      />
    </Pressable>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2.5 mt-3 px-1 text-[14px] font-semibold text-content-muted">
      {children}
    </Text>
  );
}

interface AccountSettingsMenuProps {
  onSelectAppearance: () => void;
  onSelectNotifications: () => void;
  onSelectSecurity: () => void;
  onSelectStatus: () => void;
  onSelectBilling: (section: BillingSection) => void;
  onLogout: () => void;
}

export function AccountSettingsMenu({
  onSelectAppearance,
  onSelectNotifications,
  onSelectSecurity,
  onSelectStatus,
  onSelectBilling,
  onLogout,
}: AccountSettingsMenuProps) {
  const colors = useThemeColors();
  const skyTint = withAlpha(colors.info, 0.15);

  return (
    <View className="px-4.5 pt-2">
      <GroupLabel>Mi cuenta</GroupLabel>
      <SettingsRow
        icon={<Feather name="moon" size={20} color={colors.sky} />}
        iconBackground={skyTint}
        title="Apariencia"
        subtitle="Tema de la aplicación"
        onPress={onSelectAppearance}
      />
      <SettingsRow
        icon={<Feather name="bell" size={20} color={colors.sky} />}
        iconBackground={skyTint}
        title="Notificaciones"
        subtitle="Avisos push"
        onPress={onSelectNotifications}
      />
      <SettingsRow
        icon={<Feather name="shield" size={20} color={colors.sky} />}
        iconBackground={withAlpha(PREMIUM_BRAND_COLORS.petrol, 0.3)}
        title="Seguridad"
        subtitle="Acceso y verificación"
        onPress={onSelectSecurity}
      />

      <GroupLabel>{BILLING_COPY.groupTitle}</GroupLabel>
      {BILLING_MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <SettingsRow
            key={item.id}
            icon={<Icon size={22} />}
            iconBackground={withAlpha(colors.info, 0.15)}
            title={item.label}
            subtitle={item.description}
            premiumHighlight
            onPress={() => onSelectBilling(item.id)}
          />
        );
      })}

      <GroupLabel>Plataforma</GroupLabel>
      <SettingsRow
        icon={<Feather name="activity" size={20} color={colors.sky} />}
        iconBackground={skyTint}
        title="Estado de la plataforma"
        subtitle="Servicios e incidentes"
        onPress={onSelectStatus}
      />

      <TouchableOpacity
        activeOpacity={0.75}
        className="mt-3 flex-row items-center gap-4 rounded-2xl border border-line bg-surface-raised p-4"
        onPress={onLogout}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: withAlpha(colors.danger, 0.14) }}
        >
          <Feather name="log-out" size={20} color={colors.danger} />
        </View>
        <Text className="flex-1 text-[16px] font-bold text-danger">
          Cerrar sesión
        </Text>
      </TouchableOpacity>

      <Text className="mt-4 px-1 text-[12px] text-content-subtle">
        Más opciones estarán disponibles próximamente.
      </Text>
    </View>
  );
}
