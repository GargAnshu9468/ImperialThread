import React, { useMemo, useRef, useState } from "react";
import {
    Dimensions,
    Animated,
    Image,
    Pressable,
    View,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import {
    Appbar,
    Title,
    Paragraph,
    Chip,
    Text,
    useTheme,
    Divider,
    Portal,
    Modal,
    TextInput,
    Button,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ImageView from "react-native-image-viewing";

import VariantSwatch from "../components/VariantSwatch";
import Dots from "../components/Dots";
import { useCart } from "../context/CartContext";
import CartIconBadge from "../components/CartIconBadge";

const { width } = Dimensions.get("window");
const HERO_IMG = width; // square hero
const PARALLAX = 36;

// ---- Delivery rules (swap to your backend rules) ----
const FREE_SHIP_THRESHOLD = 1499;
const FAST_ZONES = [/^56/, /^11/, /^40/]; // mock: BLR/DEL/HYD-ish

function evaluatePin(pin: string, amount: number) {
    const valid = /^[1-9][0-9]{5}$/.test(pin);
    if (!valid)
        return {
            ok: false,
            eta: "",
            cod: false,
            fee: 0,
            note: "Enter a valid 6-digit PIN",
            free: false,
        };

    const fast = FAST_ZONES.some((rx) => rx.test(pin));
    const eta = fast ? "2–3 days" : "3–5 days";
    const cod = !/^12|^60/.test(pin); // mock: some districts no COD
    const base = fast ? 79 : 99;
    const free = amount >= FREE_SHIP_THRESHOLD;
    const fee = free ? 0 : base;

    return {
        ok: true,
        eta,
        cod,
        fee,
        note: fast ? "Express eligible" : "Standard delivery",
        free,
    };
}

type ProductScreenParams = {
    product: any;
    similarProducts?: any[];
};

type SavedAddress = {
    id: string;
    name: string;
    line: string;
    pin: string;
};

const ProductScreen: React.FC<any> = ({ route, navigation }) => {
    const { product, similarProducts = [] } = route.params as ProductScreenParams;
    const theme = useTheme();
    const { add } = useCart();

    const [variantIndex, setVariantIndex] = useState(0);
    const variant = product.variants[variantIndex];

    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    // Delivery state
    const [pinSheetOpen, setPinSheetOpen] = useState(false);
    const [pincode, setPincode] = useState<string>("560001");
    const pinEval = evaluatePin(pincode, product.price);

    const [addresses, setAddresses] = useState<SavedAddress[]>([
        { id: "a1", name: "Home", line: "MG Road, Bengaluru", pin: "560001" },
        { id: "a2", name: "Office", line: "Connaught Place, New Delhi", pin: "110001" },
    ]);
    const [newPin, setNewPin] = useState("");

    // Animations
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const sheetAnim = useRef(new Animated.Value(0)).current; // 0 closed, 1 open

    const openSheet = () => {
        setPinSheetOpen(true);
        Animated.timing(sheetAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    };
    const closeSheet = () => {
        Animated.timing(sheetAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
            if (finished) setPinSheetOpen(false);
        });
    };

    const available = useMemo(
        () => (selectedSize ? variant?.stockBySize?.[selectedSize] ?? 0 : 0),
        [variant, selectedSize]
    );
    const outOfStock = available <= 0;
    const images = (variant?.images || []).map((uri: string) => ({ uri }));

    // Sheet helpers
    const addNewPin = () => {
        const trimmed = newPin.trim();
        const ok = /^[1-9][0-9]{5}$/.test(trimmed);
        if (!ok) return;
        // store as a quick address (demo)
        const addr: SavedAddress = {
            id: `new-${Date.now()}`,
            name: "Saved PIN",
            line: "Custom",
            pin: trimmed,
        };
        setAddresses((a) => [addr, ...a].slice(0, 5));
        setPincode(trimmed);
        setNewPin("");
        // re-eval automatically via pinEval getter
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Appbar.Header style={{ backgroundColor: theme.colors.primary, elevation: 4 }}>
                <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
                <Appbar.Content
                    title="Imperial Thread"
                    titleStyle={{ color: "#fff", fontWeight: "800", textAlign: "center" }}
                    style={{ alignItems: "center" }}
                />
                <CartIconBadge color="#fff" onPress={() => navigation.navigate("Cart")} />
            </Appbar.Header>

            <Animated.ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 28 }}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
            >
                {/* Title / Price */}
                <View style={styles.headerInfo}>
                    <Title style={styles.title}>{product.name}</Title>

                    <View style={styles.priceRow}>
                        <Text style={[styles.price, { color: theme.colors.primary }]}>₹{product.price}</Text>
                        {!!product.mrp && <Text style={styles.mrp}>₹{product.mrp}</Text>}
                        {!!product.mrp && (
                            <Text style={styles.offTag}>
                                {Math.max(0, Math.round(((product.mrp - product.price) / product.mrp) * 100))}% off
                            </Text>
                        )}
                    </View>

                    {/* micro badges */}
                    <View style={styles.quickBadges}>
                        <Chip compact icon={() => <Ionicons name="star" size={14} color="#FFA41C" />}>
                            {(product.rating ?? 4.5).toFixed ? (product.rating ?? 4.5).toFixed(1) : product.rating ?? 4.5}
                        </Chip>
                        <Chip compact icon={() => <Ionicons name="refresh" size={14} color="#0B8457" />}>
                            7-day return
                        </Chip>
                        <Chip compact icon={() => <Ionicons name="checkmark-done" size={14} color="#1E2749" />}>
                            Quality checked
                        </Chip>
                    </View>
                </View>

                {/* Parallax gallery */}
                <View style={styles.carousel}>
                    <Animated.FlatList
                        data={variant.images}
                        keyExtractor={(_, i) => `img-${i}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const i = Math.round(e.nativeEvent.contentOffset.x / width);
                            setImageIndex(i);
                        }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        scrollEventThrottle={16}
                        renderItem={({ item, index }) => {
                            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
                            const translateX = scrollX.interpolate({
                                inputRange,
                                outputRange: [PARALLAX, 0, -PARALLAX],
                                extrapolate: "clamp",
                            });
                            const scale = scrollX.interpolate({
                                inputRange,
                                outputRange: [0.95, 1, 0.95],
                                extrapolate: "clamp",
                            });

                            return (
                                <Pressable onPress={() => setViewerOpen(true)}>
                                    <View style={{ width }}>
                                        <Animated.View style={[styles.heroCard, { transform: [{ translateX }, { scale }] }]}>
                                            <Image source={ item } style={styles.heroImg} resizeMode="contain" />
                                            <LinearGradient colors={["rgba(0,0,0,0.08)", "transparent"]} style={styles.heroFade} />
                                        </Animated.View>
                                    </View>
                                </Pressable>
                            );
                        }}
                    />
                    <View style={styles.dotsWrap}>
                        <View style={styles.dotsPill}>
                            <Dots total={variant.images.length} index={imageIndex} />
                        </View>
                    </View>
                </View>

                {/* Delivery card with sheet trigger */}
                <LinearGradient colors={["#ffffff", "#f9fbff"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.deliveryCard}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View style={styles.deliveryIconWrap}>
                            <Ionicons name="cube-outline" size={18} color="#1E2749" />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={styles.deliveryTitle}>Delivery</Text>
                            <Text style={[styles.deliveryNote, { color: pinEval.ok ? "#0B8457" : "#d32f2f" }]}>
                                {pinEval.ok ? `To ${pincode} • ETA ${pinEval.eta}` : "Not serviceable"}
                            </Text>
                            {!!pinEval.note && <Text style={styles.deliverySub}>{pinEval.note}</Text>}
                            {pinEval.free ? (
                                <Text style={[styles.freeShip, { color: "#0B8457" }]}>Free shipping on this order</Text>
                            ) : (
                                <Text style={styles.shipFee}>Delivery fee ₹{pinEval.fee}</Text>
                            )}
                        </View>

                        <Pressable style={styles.changeBtn} onPress={openSheet}>
                            <Ionicons name="map" size={14} color="#1E2749" />
                            <Text style={styles.changeText}>Check PIN</Text>
                        </Pressable>
                    </View>
                </LinearGradient>

                {/* Variants & Sizes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Colors</Text>
                    <View style={styles.variantRow}>
                        {product.variants.map((v: any, i: number) => (
                            <VariantSwatch
                                key={`${v.color}-${i}`}
                                color={v.color}
                                hex={v.hex}
                                selected={i === variantIndex}
                                onPress={() => {
                                    setVariantIndex(i);
                                    setSelectedSize(product.sizes?.[0]);
                                }}
                            />
                        ))}
                    </View>

                    {!!product.sizes?.length && (
                        <>
                            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Size</Text>
                            <View style={styles.sizeRow}>
                                {product.sizes.map((s: string) => {
                                    const stock = variant?.stockBySize?.[s] ?? 0;
                                    const disabled = stock <= 0;
                                    const selected = selectedSize === s;
                                    return (
                                        <Chip
                                            key={s}
                                            mode={selected ? "flat" : "outlined"}
                                            selected={selected}
                                            disabled={disabled}
                                            onPress={() => !disabled && setSelectedSize(s)}
                                            style={[
                                                styles.sizeChip,
                                                selected && { backgroundColor: "rgba(30,39,73,0.08)", borderColor: theme.colors.primary },
                                            ]}
                                            textStyle={{ fontWeight: "700" }}
                                        >
                                            {s} {disabled ? "(OOS)" : ""}
                                        </Chip>
                                    );
                                })}
                            </View>
                            <Text style={[styles.stockNote, { color: outOfStock ? "#d32f2f" : "#0B8457" }]}>
                                {outOfStock ? "Out of stock" : `In stock: ${available}`}
                            </Text>
                        </>
                    )}
                </View>

                {/* About */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>About this item</Text>
                    <Paragraph style={styles.desc}>{product.description}</Paragraph>
                </View>

                {/* Offers */}
                {Array.isArray(product.offers) && product.offers.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Offers</Text>
                        {product.offers.map((offer: string, i: number) => (
                            <View key={`offer-${i}`} style={styles.offerLine}>
                                <Ionicons name="pricetag" size={18} color="#FF9900" style={{ marginRight: 8 }} />
                                <Text style={{ fontSize: 14 }}>{offer}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Reviews */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Customer reviews</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                        {[...Array(5)].map((_, i) => (
                            <Ionicons
                                key={i}
                                name={i < (product.rating ?? 0) ? "star" : "star-outline"}
                                size={18}
                                color="#FFA41C"
                            />
                        ))}
                        {!!product.rating && (
                            <Text style={{ marginLeft: 8, fontSize: 14 }}>
                                {(product.rating).toFixed ? product.rating.toFixed(1) : product.rating} / 5
                            </Text>
                        )}
                    </View>
                    <Text style={{ fontSize: 13.5, color: "#666" }}>
                        {product.reviewSummary || "No reviews yet."}
                    </Text>
                </View>

                {/* Similar */}
                {Array.isArray(similarProducts) && similarProducts.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Similar products</Text>
                        <FlatList
                            data={similarProducts}
                            keyExtractor={(it, i) => `similar-${i}`}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
                            contentContainerStyle={{ paddingVertical: 6 }}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.similarCard}
                                    onPress={() => navigation.push("Product", { product: item })}
                                >
                                    <Image
                                        source={ item?.variants?.[0]?.images?.[0] }
                                        style={styles.similarImg}
                                        resizeMode="cover"
                                    />
                                    <Text numberOfLines={1} style={styles.similarName}>{item.name}</Text>
                                    <Text style={styles.similarPrice}>₹{item.price}</Text>
                                </Pressable>
                            )}
                        />
                    </View>
                )}

                {/* CTAs */}
                <View style={styles.ctaRow}>
                    {/* Add to Cart */}
                    <LinearGradient colors={["#FF9900", "#FFB84D"]} style={[styles.ctaGrad, { flex: 1 }]}>
                        <Pressable
                            disabled={outOfStock}
                            style={[styles.ctaBtn, outOfStock && { opacity: 0.7 }]}
                            onPress={() => {
                                if (!outOfStock) {
                                    add({ ...product }, 1, selectedSize, variantIndex);
                                    navigation.navigate("Cart");
                                }
                            }}
                        >
                            <Ionicons name="cart" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.ctaText}>{outOfStock ? "Out of Stock" : "Add to Cart"}</Text>
                        </Pressable>
                    </LinearGradient>

                    {/* Buy Now */}
                    <LinearGradient colors={["#1E2749", "#2E4374"]} style={[styles.ctaGrad, { flex: 1 }]}>
                        <Pressable
                            disabled={outOfStock}
                            style={[styles.ctaBtn, outOfStock && { opacity: 0.6 }]}
                            onPress={() => {
                                if (!outOfStock) {
                                    navigation.navigate("Home", {
                                        screen: "Checkout",
                                        params: { product, variantIndex, selectedSize, pincode, eta: pinEval.eta },
                                    });
                                }
                            }}
                        >
                            <Ionicons name="flash" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.ctaText}>Buy Now</Text>
                        </Pressable>
                    </LinearGradient>
                </View>

            </Animated.ScrollView>

            {/* Fullscreen viewer */}
            <ImageView
                images={images}
                imageIndex={imageIndex}
                visible={viewerOpen}
                onRequestClose={() => setViewerOpen(false)}
            />

            {/* PIN SHEET */}
            <Portal>
                <Modal visible={pinSheetOpen} onDismiss={closeSheet} contentContainerStyle={styles.modalContainer}>
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                        <Animated.View
                            style={[
                                styles.sheet,
                                {
                                    transform: [
                                        {
                                            translateY: sheetAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [40, 0],
                                            }),
                                        },
                                    ],
                                    opacity: sheetAnim,
                                },
                            ]}
                        >
                            <View style={styles.sheetHandle} />

                            <View style={styles.sheetHeaderRow}>
                                <Text style={styles.sheetTitle}>Check availability</Text>
                                <Pressable onPress={closeSheet} hitSlop={10}>
                                    <Ionicons name="close" size={22} color="#333" />
                                </Pressable>
                            </View>

                            {/* Summary banner */}
                            <LinearGradient colors={["#eef3ff", "#ffffff"]} style={styles.summaryCard}>
                                <Ionicons name="location-outline" size={18} color="#1E2749" />
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.summaryText}>
                                        {pinEval.ok ? `Delivering to ${pincode} • ${pinEval.eta}` : "Not serviceable"}
                                    </Text>
                                    <Text style={styles.summarySub}>
                                        {pinEval.ok ? (pinEval.free ? "Free shipping on this order" : `Delivery fee ₹${pinEval.fee}`) : "Try a different PIN"}
                                    </Text>
                                </View>
                                <View style={styles.codPill}>
                                    <Ionicons name={pinEval.cod ? "cash-outline" : "close-circle-outline"} size={14} color={pinEval.cod ? "#0B8457" : "#d32f2f"} />
                                    <Text style={{ marginLeft: 6, color: pinEval.cod ? "#0B8457" : "#d32f2f", fontWeight: "800" }}>
                                        {pinEval.cod ? "COD" : "No-COD"}
                                    </Text>
                                </View>
                            </LinearGradient>

                            {/* Saved addresses */}
                            <Text style={styles.sectionLabel}>Saved addresses</Text>
                            {addresses.length === 0 ? (
                                <Text style={{ color: "#666", marginBottom: 10 }}>No saved addresses. Add a PIN below.</Text>
                            ) : (
                                <View style={{ marginBottom: 8 }}>
                                    {addresses.map((a) => {
                                        const ev = evaluatePin(a.pin, product.price);
                                        return (
                                            <Pressable
                                                key={a.id}
                                                style={({ pressed }) => [styles.addrRow, pressed && { opacity: 0.85 }]}
                                                onPress={() => setPincode(a.pin)}
                                            >
                                                <View style={styles.addrIcon}>
                                                    <Ionicons name="home-outline" size={16} color="#1E2749" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.addrTitle}>{a.name}</Text>
                                                    <Text style={styles.addrLine}>{a.line} • {a.pin}</Text>
                                                </View>
                                                <View style={styles.addrRight}>
                                                    <Text style={[styles.addrEta, { color: ev.ok ? "#0B8457" : "#d32f2f" }]}>
                                                        {ev.ok ? ev.eta : "N/A"}
                                                    </Text>
                                                    <Button
                                                        compact
                                                        mode="outlined"
                                                        onPress={() => {
                                                            setPincode(a.pin);
                                                            closeSheet();
                                                        }}
                                                        style={styles.deliverBtn}
                                                    >
                                                        Deliver here
                                                    </Button>
                                                </View>
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}

                            <Divider style={{ opacity: 0.08, marginVertical: 8 }} />

                            {/* Add new pin */}
                            <Text style={styles.sectionLabel}>Add a PIN</Text>
                            <View style={styles.pinRow}>
                                <TextInput
                                    mode="outlined"
                                    label="Pincode"
                                    value={newPin}
                                    onChangeText={setNewPin}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    style={{ flex: 1 }}
                                    left={<TextInput.Icon icon="map-marker" />}
                                />
                                <Button mode="contained" style={{ marginLeft: 8 }} onPress={addNewPin}>
                                    Add
                                </Button>
                            </View>

                            <View style={{ height: 10 }} />

                            <Button
                                mode="contained"
                                onPress={() => {
                                    // Apply current state & close
                                    closeSheet();
                                }}
                            >
                                Done
                            </Button>
                        </Animated.View>
                    </KeyboardAvoidingView>
                </Modal>
            </Portal>
        </View>
    );
};

export default ProductScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f6f6f6" },

    headerInfo: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, backgroundColor: "transparent" },
    title: { fontSize: 20, fontWeight: "900", color: "#111" },

    priceRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 },
    price: { fontSize: 22, fontWeight: "900" },
    mrp: { fontSize: 14, color: "#888", textDecorationLine: "line-through", marginBottom: 2 },
    offTag: { fontSize: 12, fontWeight: "800", color: "#0B8457", backgroundColor: "#EAF8EF", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },

    quickBadges: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },

    // Carousel
    carousel: { position: "relative", backgroundColor: "transparent" },
    heroCard: { width, height: HERO_IMG, justifyContent: "center", alignItems: "center" },
    heroImg: { width: "90%", height: "90%", backgroundColor: "transparent" },
    heroFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 60 },
    dotsWrap: { position: "absolute", bottom: 10, left: 0, right: 0, alignItems: "center" },
    dotsPill: {
        // backgroundColor: "rgba(255,255,255,0.92)",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },

    // Delivery
    deliveryCard: { marginTop: 8, marginHorizontal: 12, padding: 14, borderRadius: 14, elevation: 1 },
    deliveryIconWrap: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(30,39,73,0.08)", alignItems: "center", justifyContent: "center", marginRight: 10 },
    deliveryTitle: { fontWeight: "800", color: "#111", marginBottom: 2 },
    deliveryNote: { fontWeight: "800" },
    deliverySub: { color: "#666", marginTop: 2, fontSize: 12.5 },
    freeShip: { marginTop: 4, fontWeight: "800", fontSize: 12.5 },
    shipFee: { marginTop: 4, color: "#555", fontSize: 12.5 },
    changeBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#eef1ff" },
    changeText: { marginLeft: 6, color: "#1E2749", fontWeight: "800" },

    // Section
    section: { backgroundColor: "#fff", marginTop: 12, marginHorizontal: 12, padding: 14, borderRadius: 12, elevation: 1 },
    sectionTitle: { fontWeight: "900", fontSize: 16, color: "#111", marginBottom: 8 },
    variantRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    sizeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    sizeChip: { borderRadius: 10 },
    stockNote: { marginTop: 10, fontSize: 13.5, fontWeight: "800" },

    // Cards
    card: { backgroundColor: "#fff", marginTop: 12, marginHorizontal: 12, padding: 14, borderRadius: 12, elevation: 1 },
    cardTitle: { fontWeight: "900", fontSize: 16, color: "#111", marginBottom: 8 },
    desc: { color: "#444", lineHeight: 20 },
    offerLine: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

    // Similar
    similarCard: { width: 120, borderRadius: 10, backgroundColor: "#fff", padding: 8, elevation: 1 },
    similarImg: { width: 104, height: 104, borderRadius: 8, backgroundColor: "#fafafa" },
    similarName: { fontSize: 12.5, color: "#222", marginTop: 6 },
    similarPrice: { fontSize: 13.5, fontWeight: "900", color: "#B12704", marginTop: 2 },

    // CTAs
    ctaRow: {
        flexDirection: "row",
        marginTop: 16,
        paddingHorizontal: 12,
        gap: 10,
    },

    ctaGrad: {
        borderRadius: 10,
        overflow: "hidden",
    },

    ctaBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
    },

    ctaText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "900",
    },

    buyNow: { backgroundColor: "#FF9900", borderRadius: 10, paddingHorizontal: 18, paddingVertical: 14 },
    buyNowText: { color: "#fff", fontSize: 15, fontWeight: "900" },

    // Modal sheet
    modalContainer: { justifyContent: "flex-end" },
    sheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 14,
        paddingBottom: 18,
    },
    sheetHandle: { alignSelf: "center", width: 46, height: 5, borderRadius: 3, backgroundColor: "#e6e6e6", marginBottom: 10 },
    sheetHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
    sheetTitle: { fontSize: 16, fontWeight: "900", color: "#111" },

    summaryCard: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12 },
    summaryText: { fontWeight: "800", color: "#1E2749" },
    summarySub: { color: "#444", fontSize: 12.5, marginTop: 2 },
    codPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, marginLeft: 8, elevation: 1 },

    sectionLabel: { fontWeight: "800", color: "#222", marginBottom: 8 },
    addrRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
    addrIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(30,39,73,0.08)" },
    addrTitle: { fontWeight: "800", color: "#111" },
    addrLine: { color: "#666", fontSize: 12.5, marginTop: 2 },
    addrRight: { alignItems: "flex-end" },
    addrEta: { fontWeight: "800", fontSize: 12.5, marginBottom: 6 },
    deliverBtn: { borderRadius: 8 },

    pinRow: { flexDirection: "row", alignItems: "center" },
});
