const { Op }= require('Sequelize');
const { Good, Auction, User, Sequelize }= require('./models');

module.exports= async ()=>{
    try {
        const yesterday= new Date();
        yesterday.setDate(yesterday.getDate-1);
        const targets= await Good.findAll({ where: { soldId: null, createdAt: { [Op.lte]: yesterday }}});
        targets.forEach(async (target)=>{
            const success= await Auction.findOne({ where:{ GoodId: target.id }, order:[['bid', 'DESC']]});
            await Good.update({ SoldId: success.UserId }, { where: { id: target.id }});
            await User.update({ money: sequelize.literal(`money-${success.bid}`)}, { where: { id: success.UserId }});
        });
    } catch (err) { console.error(err); }
}