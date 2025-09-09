// App.tsx
import "react-native-gesture-handler";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  DefaultTheme as NavLightTheme,
  DarkTheme as NavDarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  Provider as PaperProvider,
  DefaultTheme as PaperLight,
  MD3DarkTheme as PaperDark,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CartProvider } from "./src/context/CartContext";
import { WishlistProvider } from "./src/context/WishlistContext";

import HomeScreen from "./src/screens/HomeScreen";
import ProductScreen from "./src/screens/ProductScreen";
import ProductsScreen from "./src/screens/ProductsScreen";
import CartScreen from "./src/screens/CartScreen";
import CheckoutScreen from "./src/screens/CheckoutScreen";
import WishlistScreen from "./src/screens/WishlistScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import OrderSuccessScreen from "./src/screens/OrderSuccessScreen";
import OrderDetailsScreen from "./src/screens/OrderDetailsScreen";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import SignupScreen from "./src/screens/SignupScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";

import CustomDrawerContent from "./src/navigation/CustomDrawerContent";

import { AuthContext } from "./src/context/AuthContext";

// Navigators
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const ImperialLightTheme = {
  ...PaperLight,
  colors: { ...PaperLight.colors, primary: "#1E2749", secondary: "#F4C095" },
};
const ImperialDarkTheme = {
  ...PaperDark,
  colors: { ...PaperDark.colors, primary: "#9db1ff", secondary: "#F4C095" },
};

// Home stack (inside Drawer)
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    </Stack.Navigator>
  );
}

// Drawer (main app after login)
function AppDrawer({ isDark, setIsDark }: { isDark: boolean; setIsDark: (v: boolean) => void }) {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: false }}
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          isDark={isDark}
          onToggleTheme={() => setIsDark((d) => !d)}
        />
      )}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Wishlist" component={WishlistScreen} />
      <Drawer.Screen name="Orders" component={OrdersScreen} />
      <Drawer.Screen name="Cart" component={CartScreen} />
      {/* Hidden routes */}
      <Drawer.Screen
        name="OrderSuccessHidden"
        component={OrderSuccessScreen}
        options={{ drawerItemStyle: { height: 0 } }}
      />
      <Drawer.Screen
        name="OrderDetailsHidden"
        component={OrderDetailsScreen}
        options={{ drawerItemStyle: { height: 0 } }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  // Auth state
  const [loading, setLoading] = useState(true);
  // isFirstLaunch === true  -> show Onboarding
  // isFirstLaunch === false -> skip Onboarding
  // we initialize as null to know when AsyncStorage check finished
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const paperTheme = useMemo(() => (isDark ? ImperialDarkTheme : ImperialLightTheme), [isDark]);
  const navTheme = isDark ? NavDarkTheme : NavLightTheme;

  // Load persisted values on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const seen = await AsyncStorage.getItem("onboardingSeen");
        // if onboardingSeen === "true" -> user completed onboarding earlier
        setIsFirstLaunch(seen !== "true");

        const token = await AsyncStorage.getItem("isLoggedIn");
        setIsLoggedIn(token === "true");
      } catch (e) {
        console.warn("App init error:", e);
        // fallback: show onboarding
        setIsFirstLaunch(true);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // auth helpers
  const login = useCallback(async () => {
    // persist only auth state here
    await AsyncStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  }, []);

  // Called when user completes onboarding (taps Get Started)
  const finishOnboarding = useCallback(async () => {
    // persist that onboarding has been seen
    await AsyncStorage.setItem("onboardingSeen", "true");
    setIsFirstLaunch(false);
  }, []);

  // Provide auth context to children/screens
  const authContextValue = useMemo(
    () => ({
      loading,
      isFirstLaunch,
      isLoggedIn,
      login,
      logout,
      finishOnboarding,
    }),
    [loading, isFirstLaunch, isLoggedIn, login, logout, finishOnboarding]
  );

  // Loading indicator while checking AsyncStorage
  if (loading || isFirstLaunch === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E4374" />
      </View>
    );
  }

  // Decide initial route explicitly
  let initialRouteName = "Login";
  if (isFirstLaunch) initialRouteName = "Onboarding";
  else if (isLoggedIn) initialRouteName = "MainApp";

  return (
    <AuthContext.Provider value={authContextValue}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <CartProvider>
            <WishlistProvider>
              <PaperProvider theme={paperTheme}>
                <NavigationContainer theme={navTheme}>
                  <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
                    {/* Keep all routes registered; initial route decides shown screen */}
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                    <Stack.Screen name="MainApp">
                      {() => <AppDrawer isDark={isDark} setIsDark={setIsDark} />}
                    </Stack.Screen>
                  </Stack.Navigator>
                </NavigationContainer>
              </PaperProvider>
            </WishlistProvider>
          </CartProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthContext.Provider>
  );
}
