import { type Channel } from "@discordia/client-shared";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Animated, View, type ViewStyle } from "react-native";

const HIGHLIGHT_BACKGROUND = "rgba(107,149,189,0.15)";
const HIGHLIGHT_BORDER = "rgba(107,149,189,0.5)";
const CONTENT_HORIZONTAL_INSET = 10;
const TOP_EDGE_LINE_OFFSET = 6;

interface BucketEntry {
  categoryId: string | null;
  ref: RefObject<View | null>;
  extendsToTop: boolean;
}

interface Rect {
  top: number;
  bottom: number;
}

export interface ChannelDragMoveResult {
  channel: Channel;
  sourceBucketKey: string;
  targetBucketKey: string;
  targetCategoryId: string | null;
}

interface ChannelDragContextValue {
  registerBucket: (
    key: string,
    categoryId: string | null,
    ref: RefObject<View | null>,
    extendsToTop?: boolean,
  ) => void;
  unregisterBucket: (key: string) => void;
  beginDrag: (
    channel: Channel,
    sourceBucketKey: string,
    rowHeight: number,
    ownRef: RefObject<View | null>,
  ) => void;
  getHomeTop: () => number | null;
  updateDrag: (absoluteCenterY: number) => string | null;
  endDrag: () => ChannelDragMoveResult | null;
  hoveredBucketKey: string | null;
  sourceBucketKey: string | null;
}

const ChannelDragReactContext = createContext<ChannelDragContextValue | null>(
  null,
);

export function useChannelDrag(): ChannelDragContextValue {
  const ctx = useContext(ChannelDragReactContext);
  if (!ctx) {
    throw new Error(
      "useChannelDrag debe usarse dentro de <ChannelDragProvider>",
    );
  }
  return ctx;
}

export function ChannelDragProvider({
  renderChannel,
  children,
}: {
  renderChannel: (channel: Channel) => ReactNode;
  children: ReactNode;
}) {
  const rootRef = useRef<View>(null);
  const rootTopRef = useRef(0);

  const bucketsRef = useRef<Map<string, BucketEntry>>(new Map());
  const rectsRef = useRef<Map<string, Rect>>(new Map());

  const sourceBucketKeyRef = useRef<string | null>(null);
  const hoveredBucketKeyRef = useRef<string | null>(null);
  const draggingChannelRef = useRef<Channel | null>(null);
  const rowHeightRef = useRef(48);
  const homeTopRef = useRef<number | null>(null);

  const [hoveredBucketKey, setHoveredBucketKey] = useState<string | null>(null);
  const [sourceBucketKey, setSourceBucketKey] = useState<string | null>(null);
  const [draggingChannel, setDraggingChannel] = useState<Channel | null>(null);

  const overlayTop = useMemo(() => new Animated.Value(0), []);
  const [overlayWidth, setOverlayWidth] = useState(0);

  const registerBucket = useCallback(
    (
      key: string,
      categoryId: string | null,
      ref: RefObject<View | null>,
      extendsToTop = false,
    ) => {
      bucketsRef.current.set(key, { categoryId, ref, extendsToTop });
    },
    [],
  );

  const unregisterBucket = useCallback((key: string) => {
    bucketsRef.current.delete(key);
  }, []);

  const beginDrag = useCallback(
    (
      channel: Channel,
      bucketKey: string,
      rowHeight: number,
      ownRef: RefObject<View | null>,
    ) => {
      sourceBucketKeyRef.current = bucketKey;
      hoveredBucketKeyRef.current = bucketKey;
      draggingChannelRef.current = channel;
      rowHeightRef.current = rowHeight;
      homeTopRef.current = null;

      setSourceBucketKey(bucketKey);
      setHoveredBucketKey(bucketKey);
      setDraggingChannel(channel);

      rectsRef.current = new Map();

      if (rootRef.current) {
        rootRef.current.measure((_x, _y, _width, _height, _pageX, pageY) => {
          rootTopRef.current = pageY;
        });
      }

      const ownNode = ownRef.current;
      if (ownNode) {
        ownNode.measure((_x, _y, width, _height, _pageX, pageY) => {
          homeTopRef.current = pageY;
          setOverlayWidth(width);
        });
      }

      bucketsRef.current.forEach((entry, key) => {
        const node = entry.ref.current;
        if (!node) return;
        node.measure((_x, _y, _width, height, _pageX, pageY) => {
          rectsRef.current.set(key, {
            top: entry.extendsToTop ? -Infinity : pageY,
            bottom: pageY + height,
          });
        });
      });
    },
    [],
  );

  const getHomeTop = useCallback(() => homeTopRef.current, []);

  const findBucketAt = useCallback((absoluteY: number): string | null => {
    for (const [key, rect] of rectsRef.current) {
      if (absoluteY >= rect.top && absoluteY <= rect.bottom) {
        return key;
      }
    }
    return null;
  }, []);

  const updateDrag = useCallback(
    (absoluteCenterY: number): string | null => {
      const hovered = findBucketAt(absoluteCenterY);
      if (hovered !== hoveredBucketKeyRef.current) {
        hoveredBucketKeyRef.current = hovered;
        setHoveredBucketKey(hovered);
      }
      overlayTop.setValue(
        absoluteCenterY - rowHeightRef.current / 2 - rootTopRef.current,
      );
      return hovered;
    },
    [findBucketAt, overlayTop],
  );

  const endDrag = useCallback((): ChannelDragMoveResult | null => {
    const channel = draggingChannelRef.current;
    const source = sourceBucketKeyRef.current;
    const hovered = hoveredBucketKeyRef.current;

    sourceBucketKeyRef.current = null;
    hoveredBucketKeyRef.current = null;
    draggingChannelRef.current = null;
    homeTopRef.current = null;
    setSourceBucketKey(null);
    setHoveredBucketKey(null);
    setDraggingChannel(null);

    if (!channel || !source || !hovered || hovered === source) {
      return null;
    }

    const targetEntry = bucketsRef.current.get(hovered);
    if (!targetEntry) return null;

    return {
      channel,
      sourceBucketKey: source,
      targetBucketKey: hovered,
      targetCategoryId: targetEntry.categoryId,
    };
  }, []);

  const value = useMemo<ChannelDragContextValue>(
    () => ({
      registerBucket,
      unregisterBucket,
      beginDrag,
      getHomeTop,
      updateDrag,
      endDrag,
      hoveredBucketKey,
      sourceBucketKey,
    }),
    [
      registerBucket,
      unregisterBucket,
      beginDrag,
      getHomeTop,
      updateDrag,
      endDrag,
      hoveredBucketKey,
      sourceBucketKey,
    ],
  );

  const isAway =
    draggingChannel !== null &&
    hoveredBucketKey !== null &&
    hoveredBucketKey !== sourceBucketKey;

  return (
    <ChannelDragReactContext.Provider value={value}>
      <View ref={rootRef} collapsable={false} style={{ flex: 1 }}>
        {children}
        {draggingChannel ? (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: overlayTop,
              left: CONTENT_HORIZONTAL_INSET,
              width: overlayWidth || undefined,
              opacity: isAway ? 1 : 0,
              zIndex: 50,
              elevation: 12,
            }}
          >
            <View
              className="bg-surface-modal border border-line-strong rounded-lg"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 10,
              }}
            >
              {renderChannel(draggingChannel)}
            </View>
          </Animated.View>
        ) : null}
      </View>
    </ChannelDragReactContext.Provider>
  );
}

export function ChannelDropZone({
  bucketKey,
  categoryId,
  isTopEdge = false,
  style,
  children,
}: {
  bucketKey: string;
  categoryId: string | null;
  isTopEdge?: boolean;
  style?: ViewStyle;
  children?: ReactNode;
}) {
  const {
    registerBucket,
    unregisterBucket,
    hoveredBucketKey,
    sourceBucketKey,
  } = useChannelDrag();
  const ref = useRef<View>(null);

  useEffect(() => {
    registerBucket(bucketKey, categoryId, ref, isTopEdge);
    return () => unregisterBucket(bucketKey);
  }, [bucketKey, categoryId, isTopEdge, registerBucket, unregisterBucket]);

  const isDropTarget =
    sourceBucketKey !== null &&
    sourceBucketKey !== bucketKey &&
    hoveredBucketKey === bucketKey;

  if (isTopEdge) {
    return (
      <View ref={ref} collapsable={false} style={style}>
        {isDropTarget ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -TOP_EDGE_LINE_OFFSET,
              left: 0,
              right: 0,
              height: 2,
              borderRadius: 1,
              backgroundColor: HIGHLIGHT_BORDER,
            }}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        style,
        isDropTarget
          ? {
              backgroundColor: HIGHLIGHT_BACKGROUND,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: HIGHLIGHT_BORDER,
            }
          : null,
      ]}
    >
      {children}
    </View>
  );
}
