housing units
med. house value
avg transit time
family satisfaction upper



prediction.creator <- function(data, change, var, model){
  col = which(colnames(data)==var) #column to change
  predictions = data.frame(matrix(nrow = 482, ncol = 8))
  names(predictions) <- c("socio_status", "fam_friendlnss", "infrastructure", "conn", "elem","upper", "health", "dev")
  
  for(i in 1:482){
    new.data <- data
    new.vals <- change #change values
    new.data[i,col] <- new.vals #reinsert values
    predictions[i,] <- lavPredict(model, type = "lv", newdata = new.data[i,]) #predict
  }
  return(predictions)
}



final.preds.fun <- function(variable){
  col<- which(names(total)==variable)
  set = median(total[,col])
  set.max = max(total[,col])
  set.min = min(total[,col])
  
  new.set <- c(set.min, set*.5, set, set*2, set.max)
  
  preds.min <- data.frame(1:300, 1:300, 1:300)
  preds.low <- data.frame(1:300, 1:300, 1:300)
  preds.med <- data.frame(1:300, 1:300, 1:300)
  preds.high <- data.frame(1:300, 1:300, 1:300)
  preds.max <- data.frame(1:300, 1:300, 1:300)
  
  
  for(i in new.set){
      preds <- prediction.creator(data = total, change = i, var = variable, model = fit)
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


final.preds.fun("fam_upper")



home <- read.csv("predictions_median_home_value.csv")
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








