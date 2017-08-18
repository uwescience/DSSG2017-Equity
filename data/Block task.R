#Code to get block, block group, tract, and neighborhood into a master file

library(foreign)
library(dplyr)
library(magrittr)

#read in .dbf with block, block group, and tract information
blocks <- read.dbf("kc_block_10.dbf", as.is = T)
blocks <- blocks[,-(6:19)]
names(blocks) <- c("obj_id", "state", "county", "census_tract", "block_group")


#read in .csv with neighborhood and tract
neighborhood <- read.csv("tract_neighborhood.csv", numerals = "no.loss", stringsAsFactors = F)
neighborhood$tract %<>% as.character
neighborhood$tract <- gsub("11001", "", neighborhood$tract)
names(neighborhood)[1] <- "census_tract"


#left join by tract
joined <- left_join(blocks, neighborhood, by = "census_tract")




corrs <- read.csv("Seattle Census Blocks and Neighborhood Correlation File.csv", stringsAsFactors = F)
corrs$GEOID10 %<>% as.character() 


#calculate total block areas
block.areas <- read.csv("Block_Areas.csv")
block.areas$GEOID10 %<>% as.character
block.areas <- block.areas[,-1]

master <- left_join(corrs, block.areas, by = "GEOID10")

#calculate which blocks are in which neighborhood

temp <- select(master, GEOID10, TRBL_10, WATER, CRA_NO, CRA_NAME, Land_Area, Water_Area)

temp$CRA_NO %<>% as.factor()

l <- tapply(temp$Land_Area, temp$CRA_NO, sum)

df <- ldply(l, data.frame, .id = "CRA_NO")
names(df)[2] <- "Total_Land_Area"

temp <- left_join(temp, df, by = "CRA_NO")

#create portion variable
temp <- mutate(temp, portion = Land_Area/Total_Land_Area)

blocks.to.neighborhood <- select(temp, GEOID10, CRA_NO, portion)

write.csv(blocks.to.neighborhood, "Block_to_Neighborhood.csv")

#block group portions

blocks.to.neighborhood <- mutate(blocks.to.neighborhood, block_group = substr(GEOID10, 1, 12))
blocks.to.neighborhood$block_group %<>% as.factor
l <- tapply(blocks.to.neighborhood$portion, blocks.to.neighborhood$block_group, sum)
df <- ldply(l, data.frame, .id = "block_group")
names(df)[2]<- "portion"

temp2 <- select(blocks.to.neighborhood, CRA_NO, block_group)

temp2 <- temp2[!duplicated(temp2[,c('CRA_NO','block_group')]),]

df <- left_join(df, temp2, by = "block_group")

write.csv(df, "BlockGroup_to_Neighborhood.csv")


#census tract to neighborhood
tract <- select(master, GEOID10, TRACT_10, CRA_NO)
tract$CRA_NO %<>% as.factor()
tract.block <- left_join(tract, blocks.to.neighborhood)
names(tract.block)[2] <- "census_tract"
l <- tapply(tract.block$portion, tract.block$TRACT_10, sum)
df <- ldply(l, data.frame, .id = "census_tract")
names(df)[2]<- "portion"
temp2 <- select(tract.block, CRA_NO, census_tract)
temp2 <- temp2[!duplicated(temp2[,c('CRA_NO','census_tract')]),]
temp2$census_tract %<>% as.factor()
df <- left_join(df, temp2, by = "census_tract")

write.csv(df, "CensusTract_to_Neighborgood.csv")


















