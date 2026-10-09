import { useRouter } from "expo-router"
import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { ServiceCard } from "@/components/ServiceCard"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { RIDE_SERVICES } from "@/data/mock"
import { routes } from "@/navigation"

export default function PassengerServices() {
  const router = useRouter()

  return (
    <Screen header>
      <PageHeader
        title="Services"
        description="Pick the ride that fits your trip."
      />

      <View className="gap-3">
        {RIDE_SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onPress={() =>
              router.push({
                pathname: routes.passenger.booking,
                params: { vehicle: service.id },
              })
            }
          />
        ))}
      </View>

      <Button onPress={() => router.push(routes.passenger.booking)}>
        <Text className="text-sm font-medium text-primary-foreground">
          Book a ride
        </Text>
      </Button>
    </Screen>
  )
}
