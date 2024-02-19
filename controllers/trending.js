import ms from 'ms';
import { Tweet } from "../sequelize.js";
import { Sequelize } from 'sequelize';

export const getTrendingHashtags = async (req, res) => {
  try {
    const timeFrame = req.query.timeFrame || '1 hour';
    const trendingHashtags = await Tweet.findAll({
      attributes: ['hashtags'],
      where: {
        createdAt: { [Sequelize.Op.gte]: new Date(Date.now() - ms(timeFrame)) },
        hashtags: { [Sequelize.Op.not]: '' }, // Filter out tweets with empty hashtags
      },
      group: ['hashtags'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('hashtags')), 'DESC']],
      limit: 1,
      raw: true,
    });

    res.json(trendingHashtags);
  } catch (error) {
    console.error('Error retrieving trending hashtags: ', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
