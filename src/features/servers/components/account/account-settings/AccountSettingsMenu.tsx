import {
  BILLING_COPY,
  type BillingSection,
  PREMIUM_BRAND_COLORS,
} from "@discordia/client-shared";

import { Text, View } from "react-native";

import { MenuGroupLabel } from "../../../../../components/ui/MenuGroupLabel";
import {
  SettingsMenuRow,
  type SettingsMenuRowPressedColors,
} from "../../../../../components/ui/SettingsMenuRow";
import {
  BILLING_MENU_ITEMS,
  type BillingMenuTone,
} from "../../../../billing/components/navigation/billingMenuItems";

const HIGHLIGHT_COLORS: Record<BillingMenuTone, SettingsMenuRowPressedColors> =
  {
    premium: {
      background: PREMIUM_BRAND_COLORS.yellow,
      tile: PREMIUM_BRAND_COLORS.deep,
      text: PREMIUM_BRAND_COLORS.deep,
    },
    boost: {
      background: PREMIUM_BRAND_COLORS.petrol,
      tile: PREMIUM_BRAND_COLORS.deep,
      text: PREMIUM_BRAND_COLORS.paper,
    },
  };

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
  return (
    <View className="px-4.5 pt-2">
      <MenuGroupLabel>Mi cuenta</MenuGroupLabel>
      <SettingsMenuRow
        icon="moon"
        title="Apariencia"
        subtitle="Tema de la aplicación"
        onPress={onSelectAppearance}
      />
      <SettingsMenuRow
        icon="bell"
        title="Notificaciones"
        subtitle="Avisos push"
        onPress={onSelectNotifications}
      />
      <SettingsMenuRow
        icon="shield"
        title="Seguridad"
        subtitle="Acceso y verificación"
        onPress={onSelectSecurity}
      />

      <MenuGroupLabel>{BILLING_COPY.groupTitle}</MenuGroupLabel>
      {BILLING_MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <SettingsMenuRow
            key={item.id}
            icon={<Icon size={22} />}
            title={item.label}
            subtitle={item.description}
            pressedColors={HIGHLIGHT_COLORS[item.tone]}
            onPress={() => onSelectBilling(item.id)}
          />
        );
      })}

      <MenuGroupLabel>Plataforma</MenuGroupLabel>
      <SettingsMenuRow
        icon="activity"
        title="Estado de la plataforma"
        subtitle="Servicios e incidentes"
        onPress={onSelectStatus}
      />

      <SettingsMenuRow
        icon="log-out"
        title="Cerrar sesión"
        danger
        showChevron={false}
        className="mt-3"
        onPress={onLogout}
      />

      <Text className="mt-4 px-1 text-[12px] text-content-subtle">
        Más opciones estarán disponibles próximamente.
      </Text>
    </View>
  );
}
