housing units
med. house value
avg transit time
family satisfaction upper



trash <- which(colnames(total) == "gis_id" | colnames(total) == "x1" | colnames(total) == "block_group")
new_total <- total[,-trash]

prediction.creator <- function(data, change, var, model){
  col = which(colnames(data)==var) #column to change
  predictions = data.frame(matrix(nrow = 482, ncol = 8))
  names(predictions) <- c("socio_status", "fam_friendlnss", "infrastructure", "conn", "elem","upper", "health", "dev")
  
  for(i in 1:482){
    new.data <- data
    new.vals <- change #change values
    new.data[i,col] <- new.vals #reinsert values
    temp <- lavPredict(model, type = "lv", newdata = scale(new.data)) #predict
    predictions[i,] <- temp[i,]
  }
  return(predictions)
}



final.preds.fun <- function(variable){
  col<- which(names(new_total)==variable)
  set = median(new_total[,col])
  set.max = max(new_total[,col])
  set.min = min(new_total[,col])
  
  new.set <- c(set.min, set*.5, set, set*2, set.max)
  
  preds.min <- data.frame(1:300, 1:300, 1:300)
  preds.low <- data.frame(1:300, 1:300, 1:300)
  preds.med <- data.frame(1:300, 1:300, 1:300)
  preds.high <- data.frame(1:300, 1:300, 1:300)
  preds.max <- data.frame(1:300, 1:300, 1:300)
  
  
  for(i in new.set){
      preds <- prediction.creator(data = new_total, change = i, var = variable, model = fit)
      preds$gis <- total$gis_id
      
      if(i == new.set[1]){
        preds.min = preds
        preds.min$indicator = c(rep(1, 482))
      } else if(i == new.set[2]){
        preds.low = preds
        preds.low$indicator = c(rep(2, 482))
      } else if(i == new.set[3]){
        preds.med = preds
        preds.med$indicator = c(rep(3, 482))
      } else if(i == new.set[4]){
        preds.high = preds
        preds.high$indicator = c(rep(4, 482))
      } else {
        preds.max = preds
        preds.max$indicator = c(rep(5, 482))
      } 
  }
  
  temp <- rbind(preds.min, preds.low, preds.med, preds.high, preds.max)
  write.csv(temp, paste0("predictions_", variable,".csv"))

}


final.preds.fun("avg_transit_time")



home <- read.csv("predictions_median_house_value.csv")
unit <- read.csv("predictions_occupied_housing_units.csv")
transit <- read.csv("predictions_avg_transit_time.csv")
fam <- read.csv("predictions_fam_upper.csv")

translation <- read.csv("Housing_indicators.csv")
block_group <- translation$block_group
block_group <- rep(block_group,5)

home <- cbind(block_group, home)
unit <- cbind(block_group, unit)
transit <- cbind(block_group, transit)
fam <- cbind(block_group, fam)

write.csv(home, "predictions_median_home_value.csv")
write.csv(unit, "predictions_occupied_housing_units.csv")
write.csv(transit, "predictions_avg_transit_time.csv")
write.csv(fam, "predictions_fam_upper.csv")


variable = "occupied_housing_units"
col<- which(names(new_total)==variable)
set = median(new_total[,col])
set.max = max(new_total[,col])
set.min = min(new_total[,col])
new.set.home <- c(set.min, set*.5, set, set*2, set.max)
new.set.trans <- c(set.min, set*.5, set, set*2, set.max)
new.set.units <- c(set.min, set*.5, set, set*2, set.max)
new.set.fam <- c(set.min, set*.5, set, set*2, set.max)

set.new <- data.frame(matrix(nrow = 20, ncol = 4))
colnames(set.new) <- c("var", "val", "name", "id")
set.new[1:5,1] <- "median_house_value"
set.new[1:5,2] <- new.set.home
set.new[6:10,1] <- "avg_transit_time"
set.new[6:10,2] <- new.set.trans
set.new[11:15,1] <- "occupied_housing_units"
set.new[11:15,2] <- new.set.units
set.new[16:20,1] <- "fam_upper"
set.new[16:20,2] <- new.set.fam

temp1 <- c("min", "half_med", "med", "double_med", "max")
temp1 <- rep(temp1, 4)
set.new$name <- temp1


temp2 <- c(1:5)
temp2 <- rep(temp2, 4)
set.new$id <- temp2

write.csv(set.new,"prediction_values_ids.csv")


