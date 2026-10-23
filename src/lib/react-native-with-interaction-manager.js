const ReactNative = require("react-native");

const scheduleIdle = (callback) => {
  if (typeof requestIdleCallback === "function") {
    const handle = requestIdleCallback(callback);
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, 0);
  return () => clearTimeout(handle);
};

const InteractionManager = {
  runAfterInteractions(task) {
    let cancel = () => {};
    const promise = new Promise((resolve) => {
      cancel = scheduleIdle(() => {
        const result = typeof task === "function" ? task() : task?.run?.();
        resolve(result);
      });
    });
    return {
      then: promise.then.bind(promise),
      done: promise.then.bind(promise),
      cancel: () => cancel(),
    };
  },
  createInteractionHandle: () => 0,
  clearInteractionHandle: () => {},
  setDeadline: () => {},
};

module.exports = new Proxy(
  {},
  {
    get: (_target, property) =>
      property === "InteractionManager"
        ? InteractionManager
        : ReactNative[property],
  },
);
