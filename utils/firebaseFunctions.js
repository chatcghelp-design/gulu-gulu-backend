exports.setUserOnline = async userId => {
    await globalFirebaseDB.collection('users').doc(userId).set(
        {
            isOnline: true
        },
        { merge: true }
    );
};

exports.setUserOffline = async userId => {
    await globalFirebaseDB.collection('users').doc(userId).set(
        {
            isOnline: false
        },
        { merge: true }
    );
};

exports.setUserBusy = async (userId, status = false) => {
    await globalFirebaseDB.collection('users').doc(userId.toString()).set(
        {
            isBusy: status
        },
        { merge: true }
    );
};
