import {
  INCIDENT_TYPE_LABELS,
  incidentSinceLabel,
  type Incident,
  PLATFORM_STATUS_LABELS,
  PLATFORM_STATUS_SUMMARIES,
  platformServiceLabel,
  type PlatformStatusResponse,
} from "@discordia/client-shared";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { withAlpha } from "../../../lib/color";
import { useThemeColors } from "../../../theme/theme-context";
import { STATUS_TONES } from "./statusTone";

export function PlatformStatusDetails({
  status,
  incidents,
}: PlatformStatusResponse) {
  const colors = useThemeColors();
  const tone = STATUS_TONES[status];
  const toneColor = tone.color(colors);
  const showIncidents = incidents.length > 0 || status !== "operational";

  return (
    <View className="gap-8">
      <View
        className="flex-row items-start gap-4 rounded-2xl border p-4"
        style={{
          backgroundColor: withAlpha(toneColor, 0.1),
          borderColor: withAlpha(toneColor, 0.3),
        }}
      >
        <View
          className="h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: withAlpha(toneColor, 0.15) }}
        >
          <Feather name={tone.icon} size={22} color={toneColor} />
        </View>
        <View className="flex-1">
          <Text className="text-[18px] font-bold leading-[22px] text-content">
            {PLATFORM_STATUS_LABELS[status]}
          </Text>
          <Text className="mt-1 text-[13px] leading-[19px] text-content-muted">
            {PLATFORM_STATUS_SUMMARIES[status]}
          </Text>
        </View>
      </View>

      {showIncidents ? (
        <View>
          <View className="mb-3 flex-row items-center gap-2">
            <Text className="text-[12px] font-bold uppercase tracking-wide text-content-subtle">
              Incidentes activos
            </Text>
            <View className="rounded-full bg-surface-input px-2 py-0.5">
              <Text className="text-[11px] font-semibold text-content-muted">
                {incidents.length}
              </Text>
            </View>
          </View>
          {incidents.length === 0 ? (
            <View className="rounded-2xl border border-dashed border-line px-4 py-8">
              <Text className="text-center text-[13px] text-content-subtle">
                No hay incidentes en este momento.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {incidents.map((incident) => (
                <IncidentItem key={incident.id} incident={incident} />
              ))}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

function IncidentItem({ incident }: { incident: Incident }) {
  const colors = useThemeColors();
  const toneColor = STATUS_TONES[incident.platform_status].color(colors);
  const services = incident.affected_services.map(platformServiceLabel);

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface-raised py-3.5 pl-5 pr-4">
      <View
        className="absolute bottom-0 left-0 top-0 w-1"
        style={{ backgroundColor: toneColor }}
      />
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-[15px] font-bold text-content">
          {incident.title}
        </Text>
        <View
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: withAlpha(toneColor, 0.15) }}
        >
          <Text
            className="text-[11px] font-semibold"
            style={{ color: toneColor }}
          >
            {INCIDENT_TYPE_LABELS[incident.platform_status]}
          </Text>
        </View>
      </View>
      {incident.description ? (
        <Text className="mt-1.5 text-[14px] leading-[20px] text-content-muted">
          {incident.description}
        </Text>
      ) : null}
      <Text className="mt-3 text-[12px] text-content-subtle">
        {services.length > 0 ? `Afecta a ${services.join(", ")} · ` : null}
        {incidentSinceLabel(incident.created_at)}
      </Text>
    </View>
  );
}
