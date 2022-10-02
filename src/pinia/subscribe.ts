export function addSubscription(subscriptions: any[], callback) {
  subscriptions.push(callback);
  const removeSubscription = () => {
    const idx = subscriptions.indexOf(callback);
    if (idx > -1) {
      subscriptions.splice(idx, 1);
    }
  };
  return removeSubscription;
}

export function triggerSubscriptions(subscriptions: any[], ...args) {
  subscriptions.slice().forEach((cb) => cb(...args));
}
