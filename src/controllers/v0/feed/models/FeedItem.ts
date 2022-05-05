import {Table, Column, HasMany, PrimaryKey, Model, CreatedAt, UpdatedAt, ForeignKey} from 'sequelize-typescript';
// import { User } from '../../users/models/User';

@Table
// export class FeedItem extends Model<FeedItem> {
export class FeedItem extends Model {
  @Column
  public caption!: string;

  @Column
  public url!: string;

  @Column
  @CreatedAt
  public createdAt: Date = new Date();

  @Column
  @UpdatedAt
  public updatedAt: Date = new Date();
}
