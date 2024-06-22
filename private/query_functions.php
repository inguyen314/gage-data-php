<?php
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function set_options($db) {
	$stmnt_query = null;
	
    try {
		$sql = "alter session set  NLS_DATE_FORMAT='mm-dd-yyyy hh24:mi'";
        $stmnt_query = oci_parse($db, $sql);
        $status = oci_execute($stmnt_query);
        if ( !$status ) {
            $e = oci_error($db);
            trigger_error(htmlentities($e['message']), E_USER_ERROR);
        }
    }
    catch (Exception $e) {
        $status = "ERROR: Could set database session options";
    }
	finally {
		oci_free_statement($stmnt_query); 
	}
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function set_options2($db) {
	//change format to = yyyy-mm-dd hh24:mi
	$stmnt_query = null;
	
    try {
        // mm-dd-yyyy hh24:mi
		$sql = "alter session set  NLS_DATE_FORMAT='yyyy-mm-dd hh24:mi'";
        $stmnt_query = oci_parse($db, $sql);
        $status = oci_execute($stmnt_query);
        if ( !$status ) {
            $e = oci_error($db);
            trigger_error(htmlentities($e['message']), E_USER_ERROR);
            // throw new \RuntimeException(self::$status);
        }
    }
    catch (Exception $e) {
        $status = "ERROR: Could set database session options";
        // throw new \RuntimeException(self::$status);
    }
	finally {
		oci_free_statement($stmnt_query); 
	}
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function find_ld_gate_cwms_ts_id($db) {
	$stmnt_query = null;
	$data = [];
	
	try {		
		$sql = "with ld24 as (            
				select  'LD 24' as project_id,
                        'LD 24 Pool-Mississippi.Stage.Inst.30Minutes.0.29' as pool,
						'LD 24 TW-Mississippi.Stage.Inst.30Minutes.0.lrgsShef-rev' as tw,
						'Louisiana-Mississippi.Stage.Inst.15Minutes.0.lrgsShef-rev' as hinge,
						'LD 24 Pool-Mississippi.Opening.Inst.~2Hours.0.lpmsShef-raw-Taint' as taint,
						'' as roll
				from dual
				fetch first 1 rows only
				),

				ld25 as (            
				select  'LD 25' as project_id,
                        'LD 25 Pool-Mississippi.Stage.Inst.30Minutes.0.29' as pool,
						'LD 25 TW-Mississippi.Stage.Inst.30Minutes.0.lrgsShef-rev' as tw,
						'Mosier Ldg-Mississippi.Stage.Inst.30Minutes.0.lrgsShef-rev' as hinge,
						'LD 25 Pool-Mississippi.Opening.Inst.~2Hours.0.lpmsShef-raw-Taint' as taint,
						'LD 25 Pool-Mississippi.Opening.Inst.~2Hours.0.lpmsShef-raw-Roll' as roll
				from dual
				fetch first 1 rows only
				),

				mel_price as (            
				select  'Mel Price' as project_id,
                        'Mel Price Pool-Mississippi.Stage.Inst.15Minutes.0.29' as pool,
						'Mel Price TW-Mississippi.Stage.Inst.30Minutes.0.lrgsShef-rev' as tw,
						'Grafton-Mississippi.Stage.Inst.30Minutes.0.lrgsShef-rev' as hinge,
						'Mel Price Pool-Mississippi.Opening.Inst.~2Hours.0.lpmsShef-raw-Taint' as taint,
						'' as roll
				from dual
				fetch first 1 rows only
				),

				nav_kaskaskia as (            
				select  'Nav Pool' as project_id,
                        'Nav Pool-Kaskaskia.Stage.Inst.30Minutes.0.29' as pool,
						'Nav TW-Kaskaskia.Stage.Inst.30Minutes.0.lrgsShef-rev' as tw,
						'Red Bud-Kaskaskia.Stage.Inst.30Minutes.0.lrgsShef-rev' as hinge,
						'Nav Pool-Kaskaskia.Opening.Inst.~2Hours.0.lpmsShef-raw-Taint' as taint,
						'' as roll
				from dual
				fetch first 1 rows only
				)
				select ld24.project_id, ld24.pool, ld24.tw, ld24.hinge, ld24.taint, ld24.roll
				from ld24 ld24
				union all 
				select ld25.project_id, ld25.pool, ld25.tw, ld25.hinge, ld25.taint, ld25.roll
				from ld25 ld25
				union all 
				select mel_price.project_id, mel_price.pool, mel_price.tw, mel_price.hinge, mel_price.taint, mel_price.roll
				from mel_price mel_price
				union all 
				select nav_kaskaskia.project_id, nav_kaskaskia.pool, nav_kaskaskia.tw, nav_kaskaskia.hinge, nav_kaskaskia.taint, nav_kaskaskia.roll
				from nav_kaskaskia nav_kaskaskia";
		
		$stmnt_query = oci_parse($db, $sql);
		$status = oci_execute($stmnt_query);

		while (($row = oci_fetch_array($stmnt_query, OCI_ASSOC+OCI_RETURN_NULLS)) !== false) {
			$obj = (object) [
				"project_id" => $row['PROJECT_ID'],
				"pool" => $row['POOL'],
				"tw" => $row['TW'],
				"hinge" => $row['HINGE'],
				"taint" => $row['TAINT'],
				"roll" => $row['ROLL']
			];
			array_push($data, $obj);
		}
	}
	catch (Exception $e) {
		$e = oci_error($db);  
		trigger_error(htmlentities($e['message']), E_USER_ERROR);

		return null;
	}
	finally {
		oci_free_statement($stmnt_query); 
	}
	return $data;
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function find_ld_gate($db, $pool, $tw, $hinge, $taint, $roll) {
	$stmnt_query = null;
	$data = [];
	
	try {		
		$sql = "with cte_pool as (
				select cwms_ts_id
					, cwms_util.change_timezone(tsv.date_time, 'UTC', 'CST6CDT') as date_time
					, cwms_util.split_text('".$pool."', 1, '.') as location_id
					, cwms_util.split_text('".$pool."', 2, '.') as parameter_id
					, value
					, unit_id
					, quality_code
				from cwms_v_tsv_dqu tsv
				where 
					tsv.cwms_ts_id = '".$pool."'  
					and date_time >= cast(cast(current_date as timestamp) at time zone 'UTC' as date) - interval '24' hour
					and date_time <= cast(cast(current_date as timestamp) at time zone 'UTC' as date) + interval '0' day
					and (tsv.unit_id = 'ppm' or tsv.unit_id = 'F' or tsv.unit_id = 
						case 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Stage', 'Elev','Opening') then 'ft' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Precip', 'Depth') then 'in' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Conc-DO') then 'ppm'
						end or tsv.unit_id in ('cfs', 'umho/cm', 'volt'))
					and tsv.office_id = 'MVS' 
					and tsv.aliased_item is null
					-- Exclude rows where the minutes part of date_time is not 0 (i.e., 30-minute intervals)
					and to_number(to_char(tsv.date_time, 'MI')) = 0
				),
				tw as (
				select cwms_ts_id
					, cwms_util.change_timezone(tsv.date_time, 'UTC', 'CST6CDT') as date_time
					, cwms_util.split_text('".$tw."', 1, '.') as location_id
					, cwms_util.split_text('".$tw."', 2, '.') as parameter_id
					, value
					, unit_id
					, quality_code
				from cwms_v_tsv_dqu tsv
				where 
					tsv.cwms_ts_id = '".$tw."'  
					and date_time >= cast(cast(current_date as timestamp) at time zone 'UTC' as date) - interval '24' hour
					and date_time <= cast(cast(current_date as timestamp) at time zone 'UTC' as date) + interval '0' day
					and (tsv.unit_id = 'ppm' or tsv.unit_id = 'F' or tsv.unit_id = 
						case 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Stage', 'Elev','Opening') then 'ft' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Precip', 'Depth') then 'in' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Conc-DO') then 'ppm'
						end or tsv.unit_id in ('cfs', 'umho/cm', 'volt'))
					and tsv.office_id = 'MVS' 
					and tsv.aliased_item is null
					-- Exclude rows where the minutes part of date_time is not 0 (i.e., 30-minute intervals)
					and to_number(to_char(tsv.date_time, 'MI')) = 0
				),
				hinge as (
				select cwms_ts_id
					, cwms_util.change_timezone(tsv.date_time, 'UTC', 'CST6CDT') as date_time
					, cwms_util.split_text('".$hinge."', 1, '.') as location_id
					, cwms_util.split_text('".$hinge."', 2, '.') as parameter_id
					, value
					, unit_id
					, quality_code
				from cwms_v_tsv_dqu tsv
				where 
					tsv.cwms_ts_id = '".$hinge."'  
					and date_time >= cast(cast(current_date as timestamp) at time zone 'UTC' as date) - interval '24' hour
					and date_time <= cast(cast(current_date as timestamp) at time zone 'UTC' as date) + interval '0' day
					and (tsv.unit_id = 'ppm' or tsv.unit_id = 'F' or tsv.unit_id = 
						case 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Stage', 'Elev','Opening') then 'ft' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Precip', 'Depth') then 'in' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Conc-DO') then 'ppm'
						end or tsv.unit_id in ('cfs', 'umho/cm', 'volt'))
					and tsv.office_id = 'MVS' 
					and tsv.aliased_item is null
					-- Exclude rows where the minutes part of date_time is not 0 (i.e., 30-minute intervals)
					and to_number(to_char(tsv.date_time, 'MI')) = 0
				),
				taint as (
				select cwms_ts_id
					, cwms_util.change_timezone(tsv.date_time, 'UTC', 'CST6CDT') as date_time
					, cwms_util.split_text('".$taint."', 1, '.') as location_id
					, cwms_util.split_text('".$taint."', 2, '.') as parameter_id
					, value
					, unit_id
					, quality_code
				from cwms_v_tsv_dqu tsv
				where 
					tsv.cwms_ts_id = '".$taint."'  
					and date_time >= cast(cast(current_date as timestamp) at time zone 'UTC' as date) - interval '24' hour
					and date_time <= cast(cast(current_date as timestamp) at time zone 'UTC' as date) + interval '0' day
					and (tsv.unit_id = 'ppm' or tsv.unit_id = 'F' or tsv.unit_id = 
						case 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Stage', 'Elev','Opening') then 'ft' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Precip', 'Depth') then 'in' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Conc-DO') then 'ppm'
						end or tsv.unit_id in ('cfs', 'umho/cm', 'volt'))
					and tsv.office_id = 'MVS' 
					and tsv.aliased_item is null
					-- Exclude rows where the minutes part of date_time is not 0 (i.e., 30-minute intervals)
					and to_number(to_char(tsv.date_time, 'MI')) = 0
				),
				roll as (
				select cwms_ts_id
					, cwms_util.change_timezone(tsv.date_time, 'UTC', 'CST6CDT') as date_time
					, cwms_util.split_text('".$roll."', 1, '.') as location_id
					, cwms_util.split_text('".$roll."', 2, '.') as parameter_id
					, value
					, unit_id
					, quality_code
				from cwms_v_tsv_dqu tsv
				where 
					tsv.cwms_ts_id = '".$roll."'  
					and date_time >= cast(cast(current_date as timestamp) at time zone 'UTC' as date) - interval '24' hour
					and date_time <= cast(cast(current_date as timestamp) at time zone 'UTC' as date) + interval '0' day
					and (tsv.unit_id = 'ppm' or tsv.unit_id = 'F' or tsv.unit_id = 
						case 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Stage', 'Elev','Opening') then 'ft' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Precip', 'Depth') then 'in' 
							when cwms_util.split_text(tsv.cwms_ts_id, 2, '.') in ('Conc-DO') then 'ppm'
						end or tsv.unit_id in ('cfs', 'umho/cm', 'volt'))
					and tsv.office_id = 'MVS' 
					and tsv.aliased_item is null
					-- Exclude rows where the minutes part of date_time is not 0 (i.e., 30-minute intervals)
					and to_number(to_char(tsv.date_time, 'MI')) = 0
				)
				select  pool.date_time, pool.cwms_ts_id as pool_cwms_ts_id, pool.value as pool, pool.location_id as pool_location_id,
						tw.cwms_ts_id as tw_cwms_ts_id, tw.value as tw, tw.location_id as tw_location_id,
						hinge.cwms_ts_id as hinge_cwms_ts_id, hinge.value as hinge, hinge.location_id as hinge_location_id,
						taint.cwms_ts_id as taint_cwms_ts_id, taint.value as taint, taint.location_id as taint_location_id,
						roll.cwms_ts_id as roll_cwms_ts_id, roll.value as roll, roll.location_id as roll_location_id
						--pool.cwms_ts_id, pool.date_time, pool.location_id, pool.parameter_id, pool.value, pool.unit_id, pool.quality_code,
						--tw.cwms_ts_id, tw.date_time, tw.location_id, tw.parameter_id, tw.value, tw.unit_id, tw.quality_code,
						--hinge.cwms_ts_id, hinge.date_time, hinge.location_id, hinge.parameter_id, hinge.value, hinge.unit_id, hinge.quality_code,
						--taint.cwms_ts_id, taint.date_time, taint.location_id, taint.parameter_id, taint.value, taint.unit_id, taint.quality_code,
						--roll.cwms_ts_id, roll.date_time, roll.location_id, roll.parameter_id, roll.value, roll.unit_id, roll.quality_code
				from  cte_pool pool
					left join tw tw on
					pool.date_time=tw.date_time
						left join hinge hinge on
						pool.date_time=hinge.date_time
							left join taint taint on
							pool.date_time=taint.date_time
								left join roll roll on
								pool.date_time=roll.date_time
				order by pool.date_time desc";
		
		$stmnt_query = oci_parse($db, $sql);
		$status = oci_execute($stmnt_query);

		while (($row = oci_fetch_array($stmnt_query, OCI_ASSOC+OCI_RETURN_NULLS)) !== false) {	
			$obj = (object) [
				"date_time" => $row['DATE_TIME'],
				"pool_cwms_ts_id" => $row['POOL_CWMS_TS_ID'],
				"pool" => $row['POOL'],
				"pool_location_id" => $row['POOL_LOCATION_ID'],
				"tw_cwms_ts_id" => $row['TW_CWMS_TS_ID'],
				"tw" => $row['TW'],
				"tw_location_id" => $row['TW_LOCATION_ID'],
				"hinge_cwms_ts_id" => $row['HINGE_CWMS_TS_ID'],
				"hinge" => $row['HINGE'],
				"hinge_location_id" => $row['HINGE_LOCATION_ID'],
				"taint_cwms_ts_id" => $row['TAINT_CWMS_TS_ID'],
				"taint" => $row['TAINT'],
				"taint_location_id" => $row['TAINT_LOCATION_ID'],
				"roll_cwms_ts_id" => $row['ROLL_CWMS_TS_ID'],
				"roll" => $row['ROLL'],
				"roll_location_id" => $row['ROLL_LOCATION_ID'],
			];
			array_push($data, $obj);
		}
	}
	catch (Exception $e) {
		$e = oci_error($db);  
		trigger_error(htmlentities($e['message']), E_USER_ERROR);

		return null;
	}
	finally {
		oci_free_statement($stmnt_query); 
	}
	return $data;
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function find_gage_control_basin($db, $basin) {
	$stmnt_query = null;
	$data = [];

	try {		
		$sql = "select 	
					loc.location_id, loc.elevation, loc.latitude, loc.longitude, loc.vertical_datum, loc.public_name, loc.location_kind_id
					,station.station, station.drainage_area, station.area_unit
					,location_level.constant_level as flood_level, location_level.location_level_id as flood_level_location_level_id, location_level.level_unit as flood_level_level_unit
					,location_level2.constant_level as ngvd29, location_level2.location_level_id as ngvd29_location_level_id, location_level2.level_unit as ngvd29_level_unit
					,cga.group_id as owner
					,cga2.group_id as basin
				from cwms_20.av_loc loc
					left join cwms_20.av_stream_location station
					on loc.location_id = station.location_id
						left join cwms_20.av_location_level location_level
						on loc.location_id = location_level.location_id
							left join cwms_20.av_location_level location_level2
							on loc.location_id = location_level2.location_id
								left join cwms_20.av_loc_grp_assgn cga
								on loc.location_id = cga.location_id
									left join cwms_20.av_loc_grp_assgn cga2
									on loc.location_id = cga2.location_id
				where 
					loc.unit_system = 'EN'
					and station.unit_system = 'EN' 
					and location_level.unit_system = 'EN'
					and location_level.level_unit = 'ft'  
					and location_level.specified_level_id = 'Flood'
					and location_level2.unit_system = 'EN'
					and location_level2.level_unit = 'ft'  
					and location_level2.specified_level_id = 'NGVD29'
					and cga.category_id = 'RDL_MVS'
					and cga2.category_id = 'RDL_Basins'
					and cga2.group_id = '".$basin."'";

		$stmnt_query = oci_parse($db, $sql);
		$status = oci_execute($stmnt_query);

		while (($row = oci_fetch_array($stmnt_query, OCI_ASSOC+OCI_RETURN_NULLS)) !== false) {
			$obj = (object) [
				"location_id" => $row['LOCATION_ID'],
				"elevation" => $row['ELEVATION'],
				"latitude" => $row['LATITUDE'],
				"longitude" => $row['LONGITUDE'],
				"vertical_datum" => $row['VERTICAL_DATUM'],
				"public_name" => $row['PUBLIC_NAME'],
				"location_kind_id" => $row['LOCATION_KIND_ID'],

				"station" => $row['STATION'],
				"drainage_area" => $row['DRAINAGE_AREA'],
				"area_unit" => $row['AREA_UNIT'],

				"flood_level" => $row['FLOOD_LEVEL'],
				"flood_level_location_level_id" => $row['FLOOD_LEVEL_LOCATION_LEVEL_ID'],
				"flood_level_level_unit" => $row['FLOOD_LEVEL_LEVEL_UNIT'],
				
				"ngvd29" => $row['NGVD29'],
				"ngvd29_location_level_id" => $row['NGVD29_LOCATION_LEVEL_ID'],
				"ngvd29_level_unit" => $row['NGVD29_LEVEL_UNIT'],
				
				"owner" => $row['OWNER'],
				"basin" => $row['BASIN']
			];
			array_push($data,$obj);
		}
	}
	catch (Exception $e) {
		$e = oci_error($db);  
		trigger_error(htmlentities($e['message']), E_USER_ERROR);

		return null;
	}
	finally {
		oci_free_statement($stmnt_query); 
	}
	return $data;
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function get_stage_data($db, $cwms_ts_id) {
	$stmnt_query = null;
	$data = null;
	
	try {		
		$sql = "with cte_last_max as (                
					select ts_code, 
						date_time, 
						cwms_ts_id, 
						cwms_util.split_text(cwms_ts_id, 1, '.') as location_id, 
						cwms_util.split_text(cwms_ts_id, 2, '.') as parameter_id, 
						value, 
						unit_id, 
						quality_code
					from CWMS_20.AV_TSV_DQU_30D
					where cwms_ts_id = '".$cwms_ts_id."'
					and (unit_id = 'ppm' or unit_id = 'F' or unit_id = CASE WHEN cwms_util.split_text(cwms_ts_id,2,'.') IN ('Stage','Elev') THEN 'ft' WHEN cwms_util.split_text(cwms_ts_id,2,'.') IN ('Precip','Depth') THEN 'in' END or unit_id = 'cfs' or unit_id = 'umho/cm' or unit_id = 'volt' or unit_id = 'su' or unit_id = 'FNU' or unit_id = 'mph' or unit_id = 'in-hg' or unit_id = 'deg')
					order by date_time desc
					fetch first 1 rows only
				),
				cte_6_hr as (
					select ts_code, 
						date_time, 
						cwms_ts_id, 
						cwms_util.split_text(cwms_ts_id, 1, '.') as location_id, 
						cwms_util.split_text(cwms_ts_id, 2, '.') as parameter_id, 
						value as value_6_hr, 
						unit_id, 
						quality_code
					from CWMS_20.AV_TSV_DQU_30D
					where cwms_ts_id = '".$cwms_ts_id."'
					and (unit_id = 'ppm' or unit_id = 'F' or unit_id = CASE WHEN cwms_util.split_text(cwms_ts_id,2,'.') IN ('Stage','Elev') THEN 'ft' WHEN cwms_util.split_text(cwms_ts_id,2,'.') IN ('Precip','Depth') THEN 'in' END or unit_id = 'cfs' or unit_id = 'umho/cm' or unit_id = 'volt' or unit_id = 'su' or unit_id = 'FNU' or unit_id = 'mph' or unit_id = 'in-hg' or unit_id = 'deg')
					and date_time = to_date((select (date_time - interval '6' hour) from cte_last_max) ,'mm-dd-yyyy hh24:mi:ss')
					order by date_time desc
					fetch first 1 rows only
				),
				cte_24_hr as (
					select ts_code, 
						date_time, 
						cwms_ts_id, 
						cwms_util.split_text(cwms_ts_id, 1, '.') as location_id, 
						cwms_util.split_text(cwms_ts_id, 2, '.') as parameter_id, 
						value as value_24_hr, 
						unit_id, 
						quality_code
					from CWMS_20.AV_TSV_DQU_30D
					where cwms_ts_id = '".$cwms_ts_id."'
					and (unit_id = 'ppm' or unit_id = 'F' or unit_id = CASE WHEN cwms_util.split_text(cwms_ts_id,2,'.') IN ('Stage','Elev') THEN 'ft' WHEN cwms_util.split_text(cwms_ts_id,2,'.') IN ('Precip','Depth') THEN 'in' END or unit_id = 'cfs' or unit_id = 'umho/cm' or unit_id = 'volt' or unit_id = 'su' or unit_id = 'FNU' or unit_id = 'mph' or unit_id = 'in-hg' or unit_id = 'deg')
					and date_time = to_date((select (date_time - interval '24' hour) from cte_last_max) ,'mm-dd-yyyy hh24:mi:ss')
					order by date_time desc
					fetch first 1 rows only
				)
				select last_max.ts_code, 
					last_max.date_time, 
					cwms_util.change_timezone(last_max.date_time, 'UTC', 'CST6CDT' ) as date_time_cst, 
					last_max.cwms_ts_id, 
					last_max.location_id, 
					last_max.parameter_id,
					last_max.value, 
					last_max.unit_id, 
					last_max.quality_code,
					
					cte_6_hr.date_time as date_time_6, 
					cwms_util.change_timezone(cte_6_hr.date_time, 'UTC', 'CST6CDT' ) as date_time_6_cst, 
					cte_6_hr.value_6_hr as value_6,
					
					cte_24_hr.date_time as date_time_24, 
					cwms_util.change_timezone(cte_24_hr.date_time, 'UTC', 'CST6CDT' ) as date_time_24_cst, 
					cte_24_hr.value_24_hr as value_24,

					(last_max.value - cte_6_hr.value_6_hr) as delta_6,
					(last_max.value - cte_24_hr.value_24_hr) as delta_24,

					sysdate - interval '8' hour as late_date
				from cte_last_max last_max
					left join cte_6_hr cte_6_hr
					on last_max.cwms_ts_id = cte_6_hr.cwms_ts_id
						left join cte_24_hr cte_24_hr
						on last_max.cwms_ts_id = cte_24_hr.cwms_ts_id";
		
		$stmnt_query = oci_parse($db, $sql);
		$status = oci_execute($stmnt_query);

		while (($row = oci_fetch_array($stmnt_query, OCI_ASSOC+OCI_RETURN_NULLS)) !== false) {
			
			$data = (object) [
				"ts_code" => $row['TS_CODE'],
				"date_time" => $row['DATE_TIME'],
				"date_time_cst" => $row['DATE_TIME_CST'],
				"cwms_ts_id" => $row['CWMS_TS_ID'],
				"location_id" => $row['LOCATION_ID'],
				"parameter_id" => $row['PARAMETER_ID'],
				"value" => $row['VALUE'],
				"unit_id" => $row['UNIT_ID'],
				"quality_code" => $row['QUALITY_CODE'],
				"date_time_6" => $row['DATE_TIME_6'],
				"date_time_6_cst" => $row['DATE_TIME_6_CST'],
				"value_6" => $row['VALUE_6'],
				"date_time_24" => $row['DATE_TIME_24'],
				"date_time_24_cst" => $row['DATE_TIME_24_CST'],
				"value_24" => $row['VALUE_24'],
				"delta_6" => $row['DELTA_6'],
				"delta_24" => $row['DELTA_24'],
				"late_date" => $row['LATE_DATE']
			];
		}
	}
	catch (Exception $e) {
		$e = oci_error($db);  
		trigger_error(htmlentities($e['message']), E_USER_ERROR);

		return null;
	}
	finally {
		oci_free_statement($stmnt_query); 
	}
	return $data;
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function find_nws_forecast($db, $cwms_ts_id, $nws_day1_date, $nws_day2_date, $nws_day3_date) {
	$stmnt_query = null;
	$data = null;
	try {		
		$sql = "with cte_day1 as (select cwms_util.change_timezone(date_time, 'UTC', 'CST6CDT') as date_time
					,value
					,cwms_ts_id
					,cwms_util.split_text(cwms_ts_id, 1, '.') as location_id
					,unit_id
					,to_char(cwms_util.change_timezone(data_entry_date, 'UTC', 'CST6CDT'), 'mm/dd HH24:MI') as data_entry_date
				from CWMS_20.AV_TSV_DQU
				where cwms_ts_id = '".$cwms_ts_id."'
					and unit_id = 'ft'
					and date_time = to_date('".$nws_day1_date."' || '12:00' ,'mm-dd-yyyy hh24:mi')
				),
				
				day_2 as (
				select cwms_util.change_timezone(date_time, 'UTC', 'CST6CDT') as date_time
					,value
					,cwms_ts_id
					,cwms_util.split_text(cwms_ts_id, 1, '.') as location_id
					,unit_id
					,to_char(cwms_util.change_timezone(data_entry_date, 'UTC', 'CST6CDT'), 'mm/dd HH24:MI') as data_entry_date
				from CWMS_20.AV_TSV_DQU
				where cwms_ts_id = '".$cwms_ts_id."'
					and unit_id = 'ft'
					and date_time = to_date('".$nws_day2_date."' || '12:00' ,'mm-dd-yyyy hh24:mi')
				),
				
				day_3 as (
				select cwms_util.change_timezone(date_time, 'UTC', 'CST6CDT') as date_time
					,value
					,cwms_ts_id
					,cwms_util.split_text(cwms_ts_id, 1, '.') as location_id
					,unit_id
					,to_char(cwms_util.change_timezone(data_entry_date, 'UTC', 'CST6CDT'), 'mm/dd HH24:MI') as data_entry_date
				from CWMS_20.AV_TSV_DQU
				where cwms_ts_id = '".$cwms_ts_id."'
					and unit_id = 'ft'
					and date_time = to_date('".$nws_day3_date."' || '12:00' ,'mm-dd-yyyy hh24:mi')
				)
				
				select day1.date_time as date_time_day1, day1.value as value_day1, day1.cwms_ts_id as cwms_ts_id_day1, day1.location_id as location_id_day1, day1.unit_id as unit_id_day1, day1.data_entry_date as data_entry_date_day1
					,day2.date_time as date_time_day2, day2.value as value_day2, day2.cwms_ts_id as cwms_ts_id_day2, day2.location_id as location_id_day2, day2.unit_id as unit_id_day2, day2.data_entry_date as data_entry_date_day2
					,day3.date_time as date_time_day3, day3.value as value_day3, day3.cwms_ts_id as cwms_ts_id_day3, day3.location_id as location_id_day3, day3.unit_id as unit_id_day3, day3.data_entry_date as data_entry_date_day3
				from cte_day1 day1
					left join day_2 day2
					on day1.location_id = day2.location_id
						left join day_3 day3
						on day1.location_id = day3.location_id
				";
		
		$stmnt_query = oci_parse($db, $sql);
		$status = oci_execute($stmnt_query);

		while (($row = oci_fetch_array($stmnt_query, OCI_ASSOC+OCI_RETURN_NULLS)) !== false) {
			
			$data = (object) [
				"date_time_day1" => $row['DATE_TIME_DAY1'],
				"data_entry_date_day1" => $row['DATA_ENTRY_DATE_DAY1'],
				"value_day1" => $row['VALUE_DAY1'],
				"unit_id_day1" => $row['UNIT_ID_DAY1'],
				"cwms_ts_id_day1" => $row['CWMS_TS_ID_DAY1'],
				"location_id_day1" => $row['LOCATION_ID_DAY1'],
				"date_time_day2" => $row['DATE_TIME_DAY2'],
				"data_entry_date_day2" => $row['DATA_ENTRY_DATE_DAY2'],
				"value_day2" => $row['VALUE_DAY2'],
				"unit_id_day2" => $row['UNIT_ID_DAY2'],
				"cwms_ts_id_day2" => $row['CWMS_TS_ID_DAY2'],
				"location_id_day2" => $row['LOCATION_ID_DAY2'],
				"date_time_day3" => $row['DATE_TIME_DAY3'],
				"data_entry_date_day3" => $row['DATA_ENTRY_DATE_DAY3'],
				"value_day3" => $row['VALUE_DAY3'],
				"unit_id_day3" => $row['UNIT_ID_DAY3'],
				"cwms_ts_id_day3" => $row['CWMS_TS_ID_DAY3'],
				"location_id_day3" => $row['LOCATION_ID_DAY3']
			];
			
		}
	}
	catch (Exception $e) {
		$e = oci_error($db);  
		trigger_error(htmlentities($e['message']), E_USER_ERROR);

		return null;
	}
	finally {
		oci_free_statement($stmnt_query); 
	}
	return $data;
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function get_crest_data($db, $cwms_ts_id) {
	$stmnt_query = null;
	$data = null;
	try {		
		$sql = "with cte_crest as (
					select cwms_ts_id
						,cwms_util.split_text(cwms_ts_id, 1, '.') as location_id
						,(cwms_util.change_timezone(date_time, 'UTC', 'CST6CDT')) as date_time
						,value
						,unit_id
						,quality_code
						,data_entry_date
					from cwms_v_tsv_dqu_30d 
					where cwms_ts_id  = '".$cwms_ts_id."'
					and unit_id = 'ft'
					order by data_entry_date desc
					fetch first 1 rows only
				)
				select cwms_ts_id
					,location_id
					,date_time
					,value
					,unit_id
					,quality_code
					,data_entry_date
				from cte_crest
				where date_time >= to_date(to_char(sysdate - 6/24, 'mm-dd-yyyy hh24:mi') ,'mm-dd-yyyy hh24:mi')";
		
		$stmnt_query = oci_parse($db, $sql);
		$status = oci_execute($stmnt_query);

		while (($row = oci_fetch_array($stmnt_query, OCI_ASSOC+OCI_RETURN_NULLS)) !== false) {
			
			$data = (object) [
				"location_id" => $row['LOCATION_ID'],
				"cwms_ts_id" => $row['CWMS_TS_ID'],
				"date_time" => $row['DATE_TIME'],
				"value" => $row['VALUE'],
				"unit_id" => $row['UNIT_ID'],
				"quality_code" => $row['QUALITY_CODE'],
				"data_entry_date" => $row['DATA_ENTRY_DATE']
			];
		}
	}
	catch (Exception $e) {
		$e = oci_error($db);  
		trigger_error(htmlentities($e['message']), E_USER_ERROR);

		return null;
	}
	finally {
		oci_free_statement($stmnt_query); 
	}
	return $data;
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
function get_record_stage($db, $cwms_ts_id) {
	$stmnt_query = null;
	$data = null;
	
	try {		
		$sql = "select location_id
					,location_level_id
					,level_date
					,constant_level
					,level_unit
				from CWMS_20.AV_LOCATION_LEVEL
				where specified_level_id = 'Record Stage' and location_id = cwms_util.split_text('".$cwms_ts_id."', 1, '.') and unit_system = 'EN'";
		
		$stmnt_query = oci_parse($db, $sql);
		$status = oci_execute($stmnt_query);

		while (($row = oci_fetch_array($stmnt_query, OCI_ASSOC+OCI_RETURN_NULLS)) !== false) {
			$data = (object) [
				"location_id" => $row['LOCATION_ID'],
				"location_level_id" => $row['LOCATION_LEVEL_ID'],
				"level_date" => $row['LEVEL_DATE'],
				"constant_level" => $row['CONSTANT_LEVEL'],
				"level_unit" => $row['LEVEL_UNIT']
			];
		}
	}
	catch (Exception $e) {
		$e = oci_error($db);  
		trigger_error(htmlentities($e['message']), E_USER_ERROR);
		return null;
	}
	finally {
		oci_free_statement($stmnt_query); 
	}
	return $data;
}
//------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------
?>
