exports.userBasicObj = {
    isDeleted: false,
    isBlocked: false,
    ...(!globalSetting.isFake && { isFake: false })
};
